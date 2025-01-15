import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, LogOut, Book, Trash2, MinusCircle, PlusCircle as PlusIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Course {
  id: string;
  name: string;
  total_hours: number;
  weekly_hours: number;
  absences: number;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const calculateAllowedAbsences = (totalHours: number, weeklyHours: number) => {
    const totalClasses = totalHours / weeklyHours;
    const maxAbsences = totalClasses * 0.25;
    return Math.floor(maxAbsences);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Erro ao deletar disciplina:', error);
    }
  };

  const handleUpdateAbsences = async (courseId: string, currentAbsences: number, increment: boolean) => {
    const newAbsences = increment ? currentAbsences + 1 : Math.max(0, currentAbsences - 1);
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({ absences: newAbsences })
        .eq('id', courseId);

      if (error) throw error;
      setCourses(courses.map(course => 
        course.id === courseId ? { ...course, absences: newAbsences } : course
      ));
    } catch (error) {
      console.error('Erro ao atualizar faltas:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Minhas Disciplinas</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/add-course"
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="h-4 w-4" />
              Adicionar Disciplina
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma disciplina</h3>
            <p className="mt-1 text-sm text-gray-500">Comece adicionando uma nova disciplina.</p>
            <div className="mt-6">
              <Link
                to="/add-course"
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle className="h-4 w-4" />
                Adicionar Disciplina
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const maxAbsences = calculateAllowedAbsences(course.total_hours, course.weekly_hours);
              const isAbsencesWarning = course.absences > maxAbsences * 0.7;
              const isAbsencesDanger = course.absences >= maxAbsences;
              
              return (
                <div
                  key={course.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Book className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.name}
                          </h3>
                          <dl className="mt-2 text-sm text-gray-500">
                            <div className="mt-1">
                              <dt className="inline">Carga horária total: </dt>
                              <dd className="inline">{course.total_hours}h</dd>
                            </div>
                            <div className="mt-1">
                              <dt className="inline">Horas semanais: </dt>
                              <dd className="inline">{course.weekly_hours}h</dd>
                            </div>
                            <div className="mt-1">
                              <dt className="inline">Faltas permitidas: </dt>
                              <dd className="inline">{maxAbsences} aulas</dd>
                            </div>
                            <div className={`mt-2 font-medium ${
                              isAbsencesDanger ? 'text-red-600' : 
                              isAbsencesWarning ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              Faltas: {course.absences} de {maxAbsences}
                            </div>
                          </dl>
                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateAbsences(course.id, course.absences, false)}
                              className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              disabled={course.absences === 0}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateAbsences(course.id, course.absences, true)}
                              className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remover disciplina"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;