'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// dynamic import to avoid SSR issues
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CarBatteryCharts = () => {
  const initialSOC = 100;
  const initialMaxTemp = 30;
  const initialMinTemp = 20;
  const initialVoltage = 450;

  const [socData, setSocData] = useState([initialSOC]);
  const [temperatureData, setTemperatureData] = useState({
    maxTemp: [initialMaxTemp],
    minTemp: [initialMinTemp],
  });
  const [maxVoltage, setMaxVoltage] = useState(initialVoltage);
  const [anomaly, setAnomaly] = useState('No Anomaly');
  const [backgroundColor, setBackgroundColor] = useState(''); // 배경색 상태 관리

  const batterySafety = 1;
  const overcharge = 'No';
  const temperatureDiff = (
    temperatureData.maxTemp[temperatureData.maxTemp.length - 1] -
    temperatureData.minTemp[temperatureData.minTemp.length - 1]
  ).toFixed(1);

  // 30초 후 전압, 온도, 어노말리 업데이트 및 화면 번쩍이는 애니메이션 추가
  useEffect(() => {
    const interval = setInterval(() => {
      // SOC가 5씩 감소
      setSocData((prev) => {
        const nextSOC =
          prev[prev.length - 1] > 0 ? prev[prev.length - 1] - 5 : 0;
        return [...prev, nextSOC];
      });

      // 온도는 최대 온도는 30도에서 유지, 최소 온도는 서서히 증가
      setTemperatureData((prev) => ({
        maxTemp: [...prev.maxTemp, initialMaxTemp],
        minTemp: [...prev.minTemp, prev.minTemp[prev.minTemp.length - 1] + 0.1],
      }));
    }, 2000); // 2초마다 업데이트

    // 30초 후 애니메이션 효과
    const timeout = setTimeout(() => {
      setMaxVoltage(800); // 전압 급등
      setTemperatureData((prev) => ({
        maxTemp: prev.maxTemp.map((temp) => temp + 50), // 최대 온도 급등
        minTemp: prev.minTemp, // 최소 온도는 그대로 유지
      }));
      setAnomaly('Anomaly Detected'); // 어노말리 값 변경
      setBackgroundColor('bg-red-500'); // 배경색 빨간색으로 변경 (번쩍이는 효과)

      // 애니메이션 효과가 사라지도록 일정 시간 후 배경색 제거
      setTimeout(() => {
        setBackgroundColor('');
      }, 1000); // 1초 후 효과 제거
    }, 30000); // 30초 후 실행

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Chart options for SOC over time
  const socChart = {
    series: [
      {
        name: 'SOC',
        data: socData,
      },
    ],
    options: {
      chart: {
        type: 'line',
        height: 400,
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000,
          },
        },
      },
      xaxis: {
        categories: socData.map((_, index) => `Time ${index + 1}`),
      },
      title: {
        text: 'Battery SOC (State of Charge) over Time',
        align: 'center',
      },
    },
  };

  // Chart options for Max & Min Temperature fluctuations
  const temperatureChart = {
    series: [
      {
        name: 'Max Temperature',
        data: temperatureData.maxTemp,
      },
      {
        name: 'Min Temperature',
        data: temperatureData.minTemp,
      },
    ],
    options: {
      chart: {
        type: 'line',
        height: 400,
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000,
          },
        },
      },
      xaxis: {
        categories: temperatureData.maxTemp.map(
          (_, index) => `Time ${index + 1}`
        ),
      },
      title: {
        text: 'Battery Temperature Fluctuations over Time',
        align: 'center',
      },
    },
  };

  // Chart options for Voltage
  const voltageChart = {
    series: [
      {
        name: 'Max Voltage',
        data: Array(socData.length).fill(maxVoltage),
      },
    ],
    options: {
      chart: {
        type: 'line',
        height: 400,
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000,
          },
        },
      },
      xaxis: {
        categories: socData.map((_, index) => `Time ${index + 1}`),
      },
      title: {
        text: 'Battery Max Voltage over Time',
        align: 'center',
      },
    },
  };

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 ${backgroundColor}`}
    >
      {/* 좌측 상단: SOC 차트 */}
      <div>
        <ApexChart
          options={socChart.options}
          series={socChart.series}
          type='line'
          height={400}
        />
      </div>

      {/* 우측 상단: 온도 차트 */}
      <div>
        <ApexChart
          options={temperatureChart.options}
          series={temperatureChart.series}
          type='line'
          height={400}
        />
      </div>

      {/* 좌측 하단: 전압 차트 */}
      <div className='lg:col-span-2'>
        <ApexChart
          options={voltageChart.options}
          series={voltageChart.series}
          type='line'
          height={400}
        />
      </div>

      {/* 좌측 하단: 배터리 주요 정보 */}
      <div className='bg-white p-4 shadow rounded-lg'>
        <h2 className='text-xl font-bold mb-4'>Battery Information</h2>
        <p>Battery Safety Rating: {batterySafety} 등급</p>
        <p>Overcharge: {overcharge}</p>
        <p>Temperature Difference: {temperatureDiff}°C</p>
      </div>

      {/* 우측 하단: 기타 배터리 정보 */}
      <div className='bg-white p-4 shadow rounded-lg'>
        <h2 className='text-xl font-bold mb-4'>Additional Information</h2>
        <p>Max Voltage: {maxVoltage} V</p>
        <p>Charging Status: Charging</p>
        <p>Anomaly: {anomaly}</p>
      </div>
    </div>
  );
};

export default CarBatteryCharts;
