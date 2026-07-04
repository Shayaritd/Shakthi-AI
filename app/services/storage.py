from abc import ABC, abstractmethod
import os
import shutil
from fastapi import UploadFile
from app.config import settings

class StorageService(ABC):
    @abstractmethod
    async def upload_file(self, file: UploadFile, relative_path: str) -> str:
        """Uploads file to storage and returns the storage path/URI"""
        pass

    @abstractmethod
    async def get_file_content(self, relative_path: str) -> bytes:
        """Retrieves binary content of the file"""
        pass

class LocalStorageService(StorageService):
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or settings.STORAGE_DIR
        os.makedirs(self.base_dir, exist_ok=True)

    async def upload_file(self, file: UploadFile, relative_path: str) -> str:
        full_path = os.path.join(self.base_dir, relative_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        # Reset file cursor just in case
        await file.seek(0)
        
        with open(full_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return relative_path

    async def get_file_content(self, relative_path: str) -> bytes:
        full_path = os.path.join(self.base_dir, relative_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"File not found: {relative_path}")
        with open(full_path, "rb") as file:
            return file.read()

class AzureBlobStorageService(StorageService):
    def __init__(self, connection_string: str, container_name: str):
        self.connection_string = connection_string
        self.container_name = container_name
        # Note: In production, initialize BlobServiceClient here:
        # from azure.storage.blob import BlobServiceClient
        # self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)

    async def upload_file(self, file: UploadFile, relative_path: str) -> str:
        # Placeholder/stub implementation for future production deployment
        # To deploy on Azure, uncomment Azure SDK imports and actual client calls:
        # blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=relative_path)
        # content = await file.read()
        # blob_client.upload_blob(content, overwrite=True)
        return relative_path

    async def get_file_content(self, relative_path: str) -> bytes:
        # Placeholder/stub implementation
        return b""

def get_storage_service() -> StorageService:
    if settings.AZURE_STORAGE_CONNECTION_STRING and settings.AZURE_STORAGE_CONTAINER:
        return AzureBlobStorageService(
            connection_string=settings.AZURE_STORAGE_CONNECTION_STRING,
            container_name=settings.AZURE_STORAGE_CONTAINER
        )
    return LocalStorageService()
