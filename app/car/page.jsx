'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// dynamic import to avoid SSR issues
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function CarBatteryDetection() {
  const router = useRouter();

  const initialSOC = 100;
  const initialMaxTemp = 30;
  const initialMinTemp = 20;
  const initialVoltage = 450;

  const [socData, setSocData] = useState([initialSOC]);
  const [temperatureData, setTemperatureData] = useState({
    maxTemp: [initialMaxTemp],
    minTemp: [initialMinTemp],
  });
  const [voltageData, setVoltageData] = useState([initialVoltage]); // 전압 데이터
  const [anomaly, setAnomaly] = useState('No Anomaly');
  const [backgroundColor, setBackgroundColor] = useState(''); // 배경색 상태 관리
  const [timeStamps, setTimeStamps] = useState([
    new Date().toLocaleTimeString(),
  ]); // x축에 표시할 시간

  let intervalId, tempIntervalId;

  const batterySafety = 1;
  const overcharge = 'No';
  const temperatureDiff = (
    temperatureData.maxTemp[temperatureData.maxTemp.length - 1] -
    temperatureData.minTemp[temperatureData.minTemp.length - 1]
  ).toFixed(1);

  useEffect(() => {
    // SOC, 전압, 타임스탬프 업데이트
    intervalId = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString();

      setSocData((prev) => {
        const nextSOC =
          prev[prev.length - 1] > 0 ? prev[prev.length - 1] - 0.1 : 0;
        return [...prev, nextSOC];
      });

      setTimeStamps((prev) => [...prev, currentTime]);

      setVoltageData((prev) => {
        const nextVoltage = 450 + Math.random() * 5;
        return [...prev, nextVoltage];
      });
    }, 1000);

    // 30초 후 어노말리 발생 및 상태 변경
    const timeoutId = setTimeout(() => {
      // 어노말리 발생
      setVoltageData((prev) => [...prev, 600]); // 전압 600V로 상승
      setTemperatureData((prev) => ({
        maxTemp: [...prev.maxTemp, 80], // 최대 온도가 80도로 상승
        minTemp: [...prev.minTemp, 50], // 최소 온도가 50도로 상승
      }));
      setAnomaly('Anomaly Detected');
      setBackgroundColor('bg-red-500'); // 배경 빨간색

      // 애니메이션 멈춤
      clearInterval(intervalId);
      clearInterval(tempIntervalId);

      // 1초 후 배경색 복구 및 alert창 표시
      setTimeout(() => {
        setBackgroundColor('');
        setVoltageData((prev) => [...prev, 450 + Math.random() * 5]); // 전압 복구

        // alert 창 띄우기
        alert(
          '배터리에 이상이 탐지되었습니다. 가까운 정비소에 가서 정비를 받으세요.'
        );
      }, 1000);
    }, 60000); // 30초 후 실행

    // 최소 온도 서서히 증가
    tempIntervalId = setInterval(() => {
      setTemperatureData((prev) => ({
        maxTemp: [...prev.maxTemp, prev.maxTemp[prev.maxTemp.length - 1]], // 최대 온도 고정
        minTemp: [...prev.minTemp, prev.minTemp[prev.minTemp.length - 1] + 0.1], // 최소 온도 서서히 상승
      }));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(tempIntervalId);
      clearTimeout(timeoutId);
    };
  }, []);

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
        categories: timeStamps,
      },
      title: {
        text: 'Battery SOC (State of Charge) over Time',
        align: 'center',
      },
    },
  };

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
        categories: timeStamps,
      },
      title: {
        text: 'Battery Temperature Fluctuations over Time',
        align: 'center',
      },
    },
  };

  const voltageChart = {
    series: [
      {
        name: 'Max Voltage',
        data: voltageData,
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
        categories: timeStamps,
      },
      title: {
        text: 'Battery Max Voltage over Time',
        align: 'center',
      },
    },
  };

  return (
    <div className={`flex flex-row h-screen ${backgroundColor}`}>
      {/* 차트 영역 */}
      <div className='flex flex-col w-2/3 p-6'>
        <div className='mb-6'>
          <ApexChart
            options={socChart.options}
            series={socChart.series}
            type='line'
            height={400}
          />
        </div>

        <div className='mb-6'>
          <ApexChart
            options={temperatureChart.options}
            series={temperatureChart.series}
            type='line'
            height={400}
          />
        </div>

        <div className=''>
          <ApexChart
            options={voltageChart.options}
            series={voltageChart.series}
            type='line'
            height={400}
          />
        </div>
      </div>

      {/* 정보 및 어노말리 디텍션 */}
      <div className='flex flex-col w-1/3 p-6'>
        <div className='bg-white p-8 shadow-lg rounded-lg mb-6 text-xl'>
          <h2 className='text-2xl font-bold mb-4'>Battery Information</h2>
          <p>Battery Safety Rating: {batterySafety} 등급</p>
          <p>Overcharge: {overcharge}</p>
          <p>Temperature Difference: {temperatureDiff}°C</p>
        </div>

        <div
          className={`bg-red-500 p-10 shadow-xl rounded-lg text-white text-center text-3xl font-bold mb-6 ${
            anomaly === 'Anomaly Detected' ? 'animate-pulse' : ''
          }`}
        >
          {anomaly}
        </div>

        {/* 모바일 화면 UI 예시 */}
        <div className='relative w-[350px] h-[700px] bg-gray-100 p-4 rounded-lg shadow-lg mb-6'>
          {/* 모바일 상단바 */}
          <div className='flex justify-between items-center bg-gray-200 p-2 rounded-t-lg'>
            <span className='text-xs'>SKT 10:21</span>
            <span className='text-xs'>배터리: 54%</span>
          </div>

          {/* 중앙 자동차 그림 및 알림 */}
          <div className='flex flex-col items-center p-4'>
            <div className='w-48 h-24 bg-gray-400 mb-4 rounded-lg'>
              <img
                src='/car_example.png'
                alt='Car'
                className='w-48 h-24 mb-4 rounded-lg'
              />
            </div>{' '}
            {/* 자동차 그림 예시 */}
            <p
              className={`text-lg font-bold ${
                anomaly === 'Anomaly Detected'
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}
            >
              {anomaly === 'Anomaly Detected'
                ? '배터리 이상 탐지'
                : '정상 상태'}
            </p>
          </div>

          {/* 모바일 하단 네비게이션 바 */}
          <div className='absolute bottom-0 left-0 right-0 bg-gray-200 p-2 rounded-b-lg flex justify-around'>
            <span className='text-xs'>홈</span>
            <span className='text-xs'>제어</span>
            <span className='text-xs'>상태</span>
            <span className='text-xs'>지도</span>
            <span className='text-xs'>더보기</span>
          </div>
        </div>
      </div>

      {/* 메인 페이지로 돌아가기 버튼 */}
      <button
        className='absolute bottom-1 right-6 bg-blue-500 text-white px-6 py-4 rounded-lg text-xl'
        onClick={() => router.push('/')}
      >
        메인 페이지로 돌아가기
      </button>
    </div>
  );
}
