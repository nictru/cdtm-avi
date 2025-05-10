import { Injectable } from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { StorageObject } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root',
})
export class StorageService extends AbstractApiService {
  async getStorageContent(bucketName: string, path: string) {
    const { data, error } = await this._supabase.storage
      .from(bucketName)
      .list(path);
    if (error) throw error;
    return data;
  }

  async getStorageObject(id: string) {
    return this.request<StorageObject>(
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

  async uploadFile(bucketName: string, path: string, file: File) {
    const { data, error } = await this._supabase.storage
      .from(bucketName)
      .upload(path, file);
    if (error) throw error;
    return data;
  }
}
