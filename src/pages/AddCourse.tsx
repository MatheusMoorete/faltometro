import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function AddCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('courses')
        .insert([{
          user_id: user?.id,
          name,
          total_hours: parseInt(totalHours),
          weekly_hours: parseInt(weeklyHours),
        }]);

      if (insertError) throw insertError;
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Painel
        </button>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Adicionar Nova Disciplina</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da Disciplina
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="totalHours" className="block text-sm font-medium text-gray-700">
                Carga Horária Total
              </label>
              <input
                type="number"
                id="totalHours"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700">
                Horas por Aula
              </label>
              <input
                type="number"
                id="weeklyHours"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Adicionar Disciplina
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCourse;