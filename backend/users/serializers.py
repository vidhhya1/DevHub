from django.contrib.auth import get_user_model
from rest_framework import serializers  
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
            "password",
            "bio",
            "github_url",
            "linkedin_url",
            "organization",
        )

        read_only_fields = (
            "id",
        )

    def create(self, validated_data):
        return User.objects.create_user(**validated_data) 
     
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
            "bio",
            "github_url",
            "linkedin_url",
            "organization",
            "profile_image",
        ) 
         
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        RefreshToken(self.token).blacklist()