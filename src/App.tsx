/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Editor from './pages/Editor';
import Export from './pages/Export';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-orange-200">
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
