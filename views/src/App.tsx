import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import CreateView from './CreateView';
import GetDataView from './GetDataView';
import PostDataView from './PostDataView';
import DetailView from './DetailView';
import EditView from './EditView';
import DebugView from './debug/DebugView';
import { useForm } from 'react-hook-form';
import ExampleForm from './debug/ExampleForm';

import 'alurkerja-ui/dist/style.css';

// Home component
const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to MockAPI</h2>
        <p className="text-gray-600 mb-6">
          Mock API service untuk testing dan development. Gunakan navigasi di atas untuk mengakses berbagai fitur.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Create Data</h3>
            <p className="text-blue-700 text-sm">Buat endpoint dan konfigurasi API baru</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Get Data</h3>
            <p className="text-green-700 text-sm">Ambil data dari endpoint yang tersedia</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Post Data</h3>
            <p className="text-purple-700 text-sm">Kirim data ke endpoint tertentu</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">Detail View</h3>
            <p className="text-yellow-700 text-sm">Lihat detail data dan konfigurasi</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">Edit Data</h3>
            <p className="text-red-700 text-sm">Edit dan update data yang ada</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-2">Debug Tools</h3>
            <p className="text-indigo-700 text-sm mb-2">Form debugging dan development tools</p>
            <a href="/debug" className="text-indigo-600 hover:text-indigo-800 text-xs underline">
              → Open Debug Example
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
    const form = useForm();
    const alurkejraProps = {
        apiBaseUrl: 'https://api.mockservice.com',
        token : 'abcdef123456',
        activeTenant: "abc123xyz",
        probis: "asdasdas",
        taskId: "asdasd",
    }; // Placeholder for any props needed
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-auto ">
            <div className='p-[10px] border rounded-sm bg-white shadow-sm h-full'>
                <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateView form={form} alurkerjaParams={alurkejraProps} />} />
              <Route path="/get-data" element={<GetDataView form={form} alurkerjaParams={alurkejraProps} />} />
              <Route path="/post-data" element={<PostDataView form={form} alurkerjaParams={alurkejraProps}  />} />
              <Route path="/detail" element={<DetailView form={form} alurkerjaParams={alurkejraProps}  />} />
              <Route path="/edit" element={<EditView  form={form} alurkerjaParams={alurkejraProps}  />} />
              <Route path="/debug" element={<ExampleForm />} />
            </Routes>
            </div>
          </main>
          
          {/* Debug Sidebar */}
          <DebugView 
            form={form} 
            data={{ alurkejraProps, currentPath: window.location.pathname }}
            title="Debug Panel"
          />
        </div>
      </div>
    </Router>
  );
};

export default App;