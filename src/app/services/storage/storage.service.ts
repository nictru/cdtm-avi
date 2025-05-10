import { Injectable, inject } from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService extends AbstractApiService {
  public authService = inject(AuthService);

  async getStorageContent(bucketName: string, path: string) {
    const { data, error } = await this._supabase.storage
      .from(bucketName)
      .list(path);
    if (error) throw error;
    return data;
  }

  async getStorageObject(id: string) {
    return this.request(
      this._supabase.rpc('get_storage_object', {
        object_id: id,
      })
    );
  }

  async getSignedUrl(bucketName: string, path: string, expiresIn: number) {
    const { data, error } = await this._supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }

  listBuckets(): Promise<any> {
    return this._supabase.storage.listBuckets();
  }

  async getPublicUrl(bucketName: string, path: string) {
    const { data } = await this._supabase.storage
      .from(bucketName)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async uploadFile(
    bucketName: string,
    file: File,
    onProgress?: (progress: number) => void
  ) {
    const filePath =
      this.authService.userId() +
      '/' +
      Date.now() +
      '_' +
      Math.random().toString(36).substring(2, 15) +
      '_' +
      file.name;

    // Using XMLHttpRequest to manually handle upload with progress
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (onProgress && event.total) {
          const progressPercent = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(progressPercent);
        }
      };

      // Initiate simple upload first to get the URL
      this._supabase.storage
        .from(bucketName)
        .upload(filePath, file)
        .then(({ data, error }) => {
          if (error) {
            reject(error);
            return;
          }

          // Final progress update
          if (onProgress) {
            onProgress(100);
          }

          resolve(data);
        })
        .catch(reject);
    });
  }
}
