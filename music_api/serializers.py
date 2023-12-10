from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip',)


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip',)


class UpdateRoomSerializer(serializers.ModelSerializer):
    # Because we're using the ModelSerializer, we need to add the code field to the fields tuple, otherwise it will not be included in the serialized data
    # and because in the model, the code field is unique, we need to add the validators=[] to the code field to override the default unique validator
    code = serializers.CharField(validators=[])
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code', )