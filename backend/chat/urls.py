from django.urls import path, include
from rest_framework.routers import DefaultRouter
from chat.views import ChatRoomViewSet, MessageViewSet, unread_count

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('unread-count/', unread_count, name='unread-count'),
    path('', include(router.urls)),
]