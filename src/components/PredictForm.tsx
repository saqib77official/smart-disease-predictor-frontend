'use client';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import * as React from 'react';

interface FormData {
  pregnancies: number;
  glucose: number;
  bloodPressure: number;
  skinThickness: number;
  insulin: number;
  bmi: number;
  diabetesPedigreeFunction: number;
  age: number;
}

export default function PredictForm() {
  const { register, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      pregnancies: 0,
      glucose: 0,
      bloodPressure: 0,
      skinThickness: 0,
      insulin: 0,
      bmi: 0,
      diabetesPedigreeFunction: 0,
      age: 0,
    },
  });

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart-disease-predictor-backend.onrender.com';

  const onSubmit = async (data: FormData) => {
    try {
      const numericData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, Number(v)])
      );
      const res = await axios.post(`${backendURL}/predict`, numericData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000, // 10s timeout
      });
      alert(`Prediction: ${res.data.prediction}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      console.error('Prediction error:', {
        message: errorMessage,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        code: axiosError.code,
      });
      alert(`Error making prediction: ${errorMessage}`);
    }
  };

  const canonicalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const FIELD_MAP: Record<string, keyof FormData> = {
    pregnancies: 'pregnancies',
    glucose: 'glucose',
    bloodpressure: 'bloodPressure',
    systolic: 'bloodPressure',
    skinthickness: 'skinThickness',
    tricepsskin: 'skinThickness',
    insulin: 'insulin',
    bmi: 'bmi',
    diabetespedigreefunction: 'diabetesPedigreeFunction',
    dpf: 'diabetesPedigreeFunction',
    age: 'age',
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return alert('No file selected');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${backendURL}/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      const extracted = res.data?.extracted ?? {};
      Object.entries(extracted).forEach(([rawKey, rawVal]) => {
        const key = FIELD_MAP[canonicalize(rawKey)];
        if (!key) return;
        const num = Number(rawVal);
        setValue(key, Number.isFinite(num) ? num : 0, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      console.error('Image extraction error:', {
        message: errorMessage,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        code: axiosError.code,
      });
      alert(`Error extracting data from image: ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Pregnancies</label>
          <input type="number" {...register('pregnancies')} className="border p-2 w-full" />
        </div>
        <div>
          <label>Glucose</label>
          <input type="number" {...register('glucose')} className="border p-2 w-full" />
        </div>
        <div>
          <label>Blood Pressure</label>
          <input type="number" {...register('bloodPressure')} className="border p-2 w-full" />
        </div>
        <div>
          <label>Skin Thickness</label>
          <input type="number" {...register('skinThickness')} className="border p-2 w-full" />
        </div>
        <div>
          <label>Insulin</label>
          <input type="number" {...register('insulin')} className="border p-2 w-full" />
        </div>
        <div>
          <label>BMI</label>
          <input type="number" step="0.1" {...register('bmi')} className="border p-2 w-full" />
        </div>
        <div>
          <label>Diabetes Pedigree Function</label>
          <input type="number" step="0.01" {...register('diabetesPedigreeFunction')} className="border p-2 w-full" />
        </div>
        <div>
          <label>Age</label>
          <input type="number" {...register('age')} className="border p-2 w-full" />
        </div>
        <div>
          <label>Upload Image for OCR</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="border p-2 w-full" />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Predict
        </button>
      </form>
    </div>
  );
}