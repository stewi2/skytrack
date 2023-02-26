from rest_framework.serializers import Serializer, CharField, DateTimeField, IntegerField

class EarthSatelliteSerializer(Serializer):
    id = IntegerField(source='model.satnum')
    name = CharField()
    epoch = DateTimeField(source='epoch.utc_datetime')