# backend/chat/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes as perm_classes
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer, CreateChatRoomSerializer
from listings.models import Listing

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(renter=user) | Q(owner=user)
        ).select_related('renter', 'owner', 'listing').prefetch_related('messages').order_by('-updated_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['post'])
    def create_or_get(self, request):
        serializer = CreateChatRoomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        listing_id = serializer.validated_data['listing_id']
        listing = get_object_or_404(Listing, id=listing_id)
        
        # Check if user is not the owner
        if request.user == listing.owner:
            return Response(
                {'error': 'You cannot create a conversation with yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Look for existing chat room
        chat_room = ChatRoom.objects.filter(
            listing=listing,
            renter=request.user,
            owner=listing.owner
        ).first()
        
        if chat_room:
            return Response(ChatRoomSerializer(chat_room, context={'request': request}).data)
        
        # Create new chat room
        chat_room = ChatRoom.objects.create(
            listing=listing,
            renter=request.user,
            owner=listing.owner
        )
        
        return Response(ChatRoomSerializer(chat_room, context={'request': request}).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat_room = self.get_object()
        messages = chat_room.messages.all().select_related('sender').order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        chat_room = self.get_object()
        # Mark all messages in this room as read for the current user
        chat_room.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'messages marked as read'})

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(chat_room__renter=user) | Q(chat_room__owner=user)
        ).select_related('sender', 'chat_room').order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


@api_view(['GET'])
@perm_classes([permissions.IsAuthenticated])
def unread_count(request):
    """Get total unread message count for current user"""
    user = request.user
    
    # Count unread messages across all rooms where user is not the sender
    total_unread = Message.objects.filter(
        Q(chat_room__renter=user) | Q(chat_room__owner=user),
        is_read=False
    ).exclude(sender=user).count()
    
    return Response({'unread_count': total_unread})