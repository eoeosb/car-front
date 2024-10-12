'use client';

// pages/index.tsx
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleCarBatteryClick = () => {
    router.push('/car'); // 자동차 내부 배터리 이상감지 페이지로 이동
  };

  const handleStationBatteryClick = () => {
    router.push('/station'); // 충전소 탑재 배터리 이상감지 페이지로 이동
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='space-x-4'>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded'
          onClick={handleCarBatteryClick}
        >
          자동차 내부 배터리 이상감지
        </button>
        <button
          className='bg-green-500 text-white px-4 py-2 rounded'
          onClick={handleStationBatteryClick}
        >
          충전소 탑재 배터리 이상감지
        </button>
      </div>
    </div>
  );
}
