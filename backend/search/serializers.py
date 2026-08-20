from rest_framework import serializers


class SearchResultSerializer(serializers.Serializer):

    type = serializers.CharField()

    id = serializers.IntegerField()

    title = serializers.CharField()

    description = serializers.CharField(
        allow_blank=True,
        required=False,
    )