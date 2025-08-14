import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface SpendingData {
  category: string;
  year: number;
  amount: number;
}

interface Bar3DProps {
  data: SpendingData[];
  width: number;
  height: number;
}

function Bar3D({ data, width, height }: Bar3DProps) {
  const bars = useMemo(() => {
    // Group data by category and year for better organization
    const categories = ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Housing", "Income", "Other"];
    const years = [2021, 2022, 2023, 2024];
    
    return data.map((item) => {
      const categoryIndex = categories.indexOf(item.category);
      const yearIndex = years.indexOf(item.year);
      
      const x = categoryIndex * 2 - 8; // Categories along X-axis
      const z = yearIndex * 2 - 3; // Years along Z-axis
      const barHeight = Math.max(0.1, item.amount / 500); // Scale height
      
      return {
        position: [x, barHeight / 2, z],
        height: barHeight,
        color: item.amount > 5000 ? '#ef4444' : item.amount > 2000 ? '#f59e0b' : '#10b981',
        category: item.category,
        year: item.year,
        amount: item.amount
      };
    });
  }, [data]);

  return (
    <group>
      {bars.map((bar, index) => (
        <group key={index} position={bar.position as [number, number, number]}>
          <mesh>
            <boxGeometry args={[1.5, bar.height, 1.5]} />
            <meshStandardMaterial color={bar.color} />
          </mesh>
          {/* Bar label */}
          {bar.amount > 0 && (
            <Text
              position={[0, bar.height + 0.5, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              ${bar.amount.toLocaleString()}
            </Text>
          )}
        </group>
      ))}
      
      {/* Grid lines */}
      <gridHelper args={[20, 20, '#666666', '#444444']} />
      
      {/* X-axis labels (Categories) */}
      {["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Housing", "Income", "Other"].map((category, index) => (
        <Text
          key={`x-${index}`}
          position={[index * 2 - 8, -0.5, -4]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {category}
        </Text>
      ))}
      
      {/* Z-axis labels (Years) */}
      {[2021, 2022, 2023, 2024].map((year, index) => (
        <Text
          key={`z-${index}`}
          position={[-10, -0.5, index * 2 - 3]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          {year}
        </Text>
      ))}
      
      {/* Y-axis label (Amount) */}
      <Text
        position={[0, 5, -10]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Amount ($)
      </Text>
    </group>
  );
}

interface ThreeDBarChartProps {
  data: SpendingData[];
  width?: number;
  height?: number;
}

export default function ThreeDBarChart({ data, width = 800, height = 600 }: ThreeDBarChartProps) {
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: 'var(--background)' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Bar3D data={data} width={width} height={height} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}