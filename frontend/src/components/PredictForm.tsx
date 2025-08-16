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

  const onSubmit = async (data: FormData) => {
    try {
      const numericData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, Number(v)])
      );
      const res = await axios.post('http://localhost:8080/predict', numericData);
      alert(`Prediction: ${res.data.prediction}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      console.error('Prediction error:', {
        message: errorMessage,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      alert(`Error making prediction: ${errorMessage}`);
    }
  };

  // --- Restored & hardened mapping for OCR -> form fields ---
  const canonicalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const FIELD_MAP: Record<string, keyof FormData> = {
    // canonical -> form key
    pregnancies: 'pregnancies',
    glucose: 'glucose',
    bloodpressure: 'bloodPressure',
    systolic: 'bloodPressure',  // optional alias
    skinthickness: 'skinThickness',
    tricepsskin: 'skinThickness', // optional alias
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
      const res = await axios.post('http://localhost:8080/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const extracted = res.data?.extracted ?? {};
      // Accept keys like "Pregnancies", "Diabetes Pedigree Function", "blood_pressure", etc.
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
      });
      alert(`Error extracting data from image: ${errorMessage}`);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div className="form-header">
          <h2>Diabetes Prediction</h2>
          <p>Fill in the details below to predict the likelihood of diabetes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          {[
            { name: 'pregnancies', label: 'Pregnancies', placeholder: 'Number of pregnancies' },
            { name: 'glucose', label: 'Glucose', placeholder: 'Glucose level', step: '0.1' },
            { name: 'bloodPressure', label: 'Blood Pressure', placeholder: 'Blood pressure', step: '0.1' },
            { name: 'skinThickness', label: 'Skin Thickness', placeholder: 'Skin thickness', step: '0.1' },
            { name: 'insulin', label: 'Insulin', placeholder: 'Insulin level', step: '0.1' },
            { name: 'bmi', label: 'BMI', placeholder: 'BMI', step: '0.1' },
            { name: 'diabetesPedigreeFunction', label: 'Diabetes Pedigree Function', placeholder: 'DPF', step: '0.01' },
            { name: 'age', label: 'Age', placeholder: 'Age' },
          ].map((field) => (
            <div className="form-group" key={field.name}>
              <label>{field.label}</label>
              <input
                type="number"
                step={field.step}
                {...register(field.name as keyof FormData, { valueAsNumber: true })}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <div className="form-group file-upload">
            <label>Upload Medical Report Image</label>
            <input name="report" type="file" onChange={handleImageUpload} accept="image/*" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Predict</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                ([
                  'pregnancies',
                  'glucose',
                  'bloodPressure',
                  'skinThickness',
                  'insulin',
                  'bmi',
                  'diabetesPedigreeFunction',
                  'age',
                ] as (keyof FormData)[]).forEach((k) => setValue(k, 0));
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #d0e6ff, #f3d1ff, #ffe0f1);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .form-container {
          background: #fff;
          border-radius: 1.5rem;
          padding: 2.5rem;
          max-width: 900px;
          width: 100%;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.8s ease-out;
        }
        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .form-header h2 {
          font-size: 2rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .form-header p {
          color: #666;
          font-size: 1rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #444;
        }
        .form-group input {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 0.75rem;
          background: #f9fafb;
          transition: all 0.3s ease;
        }
        .form-group input:focus {
          border-color: #6b46c1;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.2);
          background: #fff;
        }
        .file-upload input[type="file"] {
          padding: 0.5rem;
          background: #fff0f5;
          border: 1px dashed #ff69b4;
          cursor: pointer;
        }
        .form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .btn-primary,
        .btn-secondary {
          flex: 1;
          padding: 0.85rem 1.2rem;
          font-size: 1rem;
          font-weight: bold;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          color: #fff;
        }
        .btn-primary:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
        .btn-secondary {
          background: #374151;
          color: #fff;
        }
        .btn-secondary:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(55, 65, 81, 0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
