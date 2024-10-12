'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const initialVehicles = [
  {
    id: 1,
    name: '차량 1',
    soc: Array(5).fill(5 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
  {
    id: 2,
    name: '차량 2',
    soc: Array(5).fill(30 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
  {
    id: 3,
    name: '차량 3',
    soc: Array(5).fill(15 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
  {
    id: 4,
    name: '차량 4',
    soc: Array(5).fill(20 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
  {
    id: 5,
    name: '차량 5',
    soc: Array(5).fill(50 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
  {
    id: 6,
    name: '차량 6',
    soc: Array(5).fill(60 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
  {
    id: 7,
    name: '차량 7',
    soc: Array(5).fill(25 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
  {
    id: 8,
    name: '차량 8',
    soc: Array(5).fill(34 + Math.random() * 20),
    timestamps: [],
    anomalyDetected: false,
    overchargeProtection: 'ON',
    chargeState: '급속',
    batteryGrade: '1등급',
  },
];

export default function StationBatteryDetection() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicles[0]);
  const [lastClickedVehicle, setLastClickedVehicle] = useState(null);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const MAX_DATA_POINTS = 20; // SOC 데이터포인트 제한

  const handleBackClick = () => {
    router.push('/');
  };

  const handleVehicleClick = (vehicle) => {
    if (lastClickedVehicle && lastClickedVehicle.id === vehicle.id) {
      alert('Anomaly Detected!');
      setAnomalyDetected(true);
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) =>
          v.id === vehicle.id
            ? {
                ...v,
                anomalyDetected: true,
                overchargeProtection: 'OFF',
                chargeState: '초급속',
                batteryGrade: '3등급',
              }
            : v
        )
      );
    } else {
      setAnomalyDetected(false);
      setSelectedVehicle(vehicle);
    }
    setLastClickedVehicle(vehicle);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString();

      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle.anomalyDetected
            ? vehicle
            : {
                ...vehicle,
                soc: [
                  ...vehicle.soc.slice(-MAX_DATA_POINTS + 1), // 최신 20개의 데이터만 유지
                  Math.min(vehicle.soc[vehicle.soc.length - 1] + 0.01, 100),
                ],
                timestamps: [
                  ...vehicle.timestamps.slice(-MAX_DATA_POINTS + 1), // 최신 타임스탬프만 유지
                  currentTime,
                ],
              }
        )
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const [batteryInfo, setBatteryInfo] = useState({
    maxTemp: 30,
    minTemp: 10,
    voltage: 450,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBatteryInfo((prev) => ({
        ...prev,
        maxTemp: (29 + Math.random() * 2).toFixed(2),
        minTemp: (10 + Math.random() * 5).toFixed(2),
      }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setSelectedVehicle((prevSelected) => {
      const updatedVehicle = vehicles.find(
        (vehicle) => vehicle.id === prevSelected.id
      );
      return updatedVehicle || prevSelected;
    });
  }, [vehicles]);

  const socChart = useMemo(() => {
    return {
      series: [
        {
          name: 'SOC',
          data: selectedVehicle.soc,
        },
      ],
      options: {
        chart: {
          type: 'line',
          height: 350,
        },
        xaxis: {
          categories: selectedVehicle.timestamps,
        },
        title: {
          text: `Battery SOC for ${selectedVehicle.name}`,
        },
      },
    };
  }, [selectedVehicle]);

  return (
    <div className='flex h-screen'>
      <div className='w-1/2 p-4 bg-gray-100 flex flex-col items-center'>
        <h2 className='text-3xl font-bold mb-4'>충전소 차량 목록</h2>
        <div className='grid grid-cols-2 gap-6'>
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-8 border-2 rounded-lg text-center cursor-pointer text-2xl ${
                selectedVehicle.id === vehicle.id ? 'bg-blue-200' : 'bg-white'
              } ${
                anomalyDetected && selectedVehicle.id === vehicle.id
                  ? 'bg-red-500'
                  : ''
              }`}
              onClick={() => handleVehicleClick(vehicle)}
            >
              <p className='font-bold'>{vehicle.name}</p>
              <p>SOC: {vehicle.soc[vehicle.soc.length - 1].toFixed(2)}%</p>
            </div>
          ))}
        </div>
        <button
          className='bg-green-500 text-white px-6 py-3 rounded-lg mt-8 text-xl'
          onClick={handleBackClick}
        >
          메인 페이지로 돌아가기
        </button>
      </div>

      <div className='w-1/2 p-8 bg-white'>
        <h2 className='text-3xl font-bold mb-6'>
          {selectedVehicle.name}의 배터리 상태
        </h2>
        <ApexChart
          options={socChart.options}
          series={socChart.series}
          type='line'
          height={350}
        />
        <div className='mt-6 p-8 bg-gray-50 border-2 rounded-lg text-xl'>
          <h3 className='text-2xl font-bold mb-4'>배터리 정보</h3>
          <p>
            SOC:{' '}
            {selectedVehicle.soc[selectedVehicle.soc.length - 1].toFixed(2)}%
          </p>
          <p>최대 온도: {batteryInfo.maxTemp}°C</p>
          <p>최소 온도: {batteryInfo.minTemp}°C</p>
          <p>전압: {batteryInfo.voltage}V</p>
          <p>
            과충전 방지 장치 작동 여부: {selectedVehicle.overchargeProtection}
          </p>
          <p>충전 상태: {selectedVehicle.chargeState}</p>
          <p>배터리 등급: {selectedVehicle.batteryGrade}</p>
        </div>
        {anomalyDetected && (
          <div className='mt-4 p-6 bg-red-600 border-4 border-red-700 rounded-lg text-white shadow-lg text-center'>
            <h3 className='text-3xl font-bold'>⚠️ Anomaly Detected ⚠️</h3>
            <p className='mt-2 text-xl'>배터리 이상이 감지되었습니다!</p>
            <p className='mt-1 text-lg'>충전을 중지하십시오.</p>
          </div>
        )}
      </div>
    </div>
  );
}
