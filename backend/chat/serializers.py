# backend/chat/serializers.py
from rest_framework import serializers
from .models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ListingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    daily_price = serializers.DecimalField(max_digits=10, decimal_places=2)

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'chat_room', 'sender', 'content', 'is_read', 'created_at']
        read_only_fields = ['sender', 'is_read', 'created_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    renter = UserSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    listing = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'listing', 'renter', 'owner', 'last_message', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['renter', 'owner', 'created_at', 'updated_at']
    
    def get_listing(self, obj):
        if obj.listing:
            return {
                'id': obj.listing.id,
                'title': obj.listing.title,
                'daily_price': str(obj.listing.daily_price)
            }
        return None
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'content': last_message.content,
                'created_at': last_message.created_at,
                'sender_id': last_message.sender.id
            }
        return None
    
    def get_unread_count(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user:
            return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return 0

class CreateChatRoomSerializer(serializers.Serializer):
    listing_id = serializers.IntegerField(required=True)


class CreateChatRoomForRenterSerializer(serializers.Serializer):
    """Serializer for owner to create/get chat with a specific renter"""
    listing_id = serializers.IntegerField(required=True)
    renter_id = serializers.IntegerField(required=True)