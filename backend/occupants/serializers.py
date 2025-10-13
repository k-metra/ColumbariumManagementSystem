from rest_framework import serializers
from niches.models import Niche
from .models import Occupant

class OccupantSerializer(serializers.ModelSerializer):
    # 'required' is false because we are injecting it via context in the view
    niche = serializers.SlugRelatedField(
        slug_field="location",
        read_only=True,
        required=False)

    class Meta:
        model = Occupant
        fields = "__all__"

    def create(self, validated_data):
        niche = self.context.get('niche') or validated_data.pop('niche', None)

        if not niche:
            raise serializers.ValidationError({"niche": "Niche must be provided."})
        return Occupant.objects.create(niche=niche, **validated_data)