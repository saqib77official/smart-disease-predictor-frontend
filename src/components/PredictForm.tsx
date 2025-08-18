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

  const backendURL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://smart-disease-predictor-backend.onrender.com';

  const onSubmit = async (data: FormData) => {
    try {
      const numericData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, Number(v)])
      );
      const res = await axios.post(`${backendURL}/predict`, numericData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      alert(`Prediction: ${res.data.prediction}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        'Unknown error';
      console.error('Prediction error:', {
        message: errorMessage,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        code: axiosError.code,
      });
      alert(`Error making prediction: ${errorMessage}`);
    }
  };

  const canonicalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, '');
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
        axiosError.response?.data?.error ||
        axiosError.message ||
        'Unknown error';
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6EE7B7, #3B82F6, #9333EA)',
        padding: '20px',
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '30px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          color: '#fff',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          Diabetes Prediction Form
        </h2>

        {[
          { label: 'Pregnancies', name: 'pregnancies', step: '1' },
          { label: 'Glucose', name: 'glucose', step: '1' },
          { label: 'Blood Pressure', name: 'bloodPressure', step: '1' },
          { label: 'Skin Thickness', name: 'skinThickness', step: '1' },
          { label: 'Insulin', name: 'insulin', step: '1' },
          { label: 'BMI', name: 'bmi', step: '0.1' },
          {
            label: 'Diabetes Pedigree Function',
            name: 'diabetesPedigreeFunction',
            step: '0.01',
          },
          { label: 'Age', name: 'age', step: '1' },
        ].map((field, i) => (
          <div key={i} style={{ marginBottom: '15px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 600,
              }}
            >
              {field.label}
            </label>
            <input
              type="number"
              step={field.step}
              {...register(field.name as keyof FormData)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.3)',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
            }}
          >
            Upload Image for OCR
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            background:
              'linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(147,51,234,1) 100%)',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            color: '#fff',
            fontWeight: 600,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              'scale(1.05)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Predict
        </button>
      </form>
    </div>
  );
}
