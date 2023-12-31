from django.shortcuts import render         
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoomView(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'
    
    def get(self, request, format=None, *args, **kwargs):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room_queryset = Room.objects.filter(code=code)
            if room_queryset.exists():
                room = room_queryset[0]

                # Serialize the data to send back to the client
                data = self.serializer_class(room).data
                data['is_host'] = self.request.session.session_key == room.host

                print("data:GetRoomView ", data)
                return Response(data, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    def post(self, request, format=None, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # Deserialize the data from the request body
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
            
            # Serialize the data to send back to the client, it means the room object that we just created
            response_data = RoomSerializer(room).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoomView(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_queryset = Room.objects.filter(code=code)
            if room_queryset.exists():
                room = room_queryset[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)
    

class UserInRoomView(APIView):
    def get(self, request, format=None, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        data = {
            'code': self.request.session.get('room_code')
        }
        print("data:UserInRoomView ", data)
        return Response(data, status=status.HTTP_200_OK)


class LeaveRoomView(APIView):
    def post(self, request, format=None, *args, **kwargs):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_queryset = Room.objects.filter(host=host_id)
            if room_queryset.exists():
                room = room_queryset[0]
                room.delete()
        
        return Response({'message': 'Success'}, status=status.HTTP_200_OK)
    

class UpdateRoomView(APIView):
    serializer_class = UpdateRoomSerializer
    def patch(self, request, format=None, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        # Deserialize the data from the request body
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            room_queryset = Room.objects.filter(code=code)
            if not room_queryset.exists():
                return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

            room = room_queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'error': 'You are not the host of this room'}, status=status.HTTP_403_FORBIDDEN)
            
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            
        
        return Response({'error': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
