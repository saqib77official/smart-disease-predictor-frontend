'use client';

import PredictForm from '../components/PredictForm';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
            {/* Centered Heading */}
           <center>
            <h1 className="text-5xl font-extrabold text-orange-600 mb-10 text-center tracking-tight animate-fade-in drop-shadow-lg">
                Smart Disease Predictor
            </h1>
            </center>

            {/* Form Container */}
            <div className="container mx-auto max-w-5xl p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:shadow-3xl animate-slide-in">
                <PredictForm />
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-in {
                    animation: slideIn 0.9s ease-out;
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out;
                }
            `}</style>
        </div>
    );
}
