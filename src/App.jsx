import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CapturesPage from './pages/CapturesPage';
import MemberPage from './pages/MemberPage';
import WatersPage from './pages/WatersPage';
import WaterDetailPage from './pages/WaterDetailPage';
import BrandsPage from './pages/BrandsPage';
import CebosPage from './pages/CebosPage';
import UploadPanelPage from './pages/UploadPanelPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/capturas" element={<CapturesPage />} />
        <Route path="/pescadores/:memberId" element={<MemberPage />} />
        <Route path="/charcas" element={<WatersPage />} />
        <Route path="/charcas/:waterId" element={<WaterDetailPage />} />
        <Route path="/marcas" element={<BrandsPage />} />
        <Route path="/cebos" element={<CebosPage />} />
        <Route path="/panel" element={<UploadPanelPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
