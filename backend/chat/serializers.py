# backend/chat/serializers.py
from rest_framework import serializers
from .models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ChatRoomSerializer(serializers.ModelSerializer):
    renter = UserSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'listing', 'renter', 'owner', 'created_at', 'updated_at']
        read_only_fields = ['renter', 'owner', 'created_at', 'updated_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='sender',
        write_only=True
    )
    
    class Meta:
        model = Message
        fields = ['id', 'chat_room', 'sender', 'sender_id', 'content', 'is_read', 'created_at']
        read_only_fields = ['sender', 'is_read', 'created_at']

class CreateChatRoomSerializer(serializers.Serializer):
    listing_id = serializers.IntegerField(required=True)