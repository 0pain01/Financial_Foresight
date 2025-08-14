import React from 'react';
import Plot from 'react-plotly.js';

interface SpendingData {
  category: string;
  year: number;
  amount: number;
}

interface ThreeDBarChartProps {
  data: SpendingData[];
  width?: number;
  height?: number;
}

export default function ThreeDBarChart({ data, width = 800, height = 500 }: ThreeDBarChartProps) {
  // Transform data for Plotly 3D bar chart
  const categories = ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Housing", "Income", "Other"];
  const years = [2021, 2022, 2023, 2024];
  
  // Create 2D matrix for surface plot
  const zMatrix: number[][] = [];
  
  categories.forEach(category => {
    const row: number[] = [];
    years.forEach(year => {
      const dataPoint = data.find(d => d.category === category && d.year === year);
      row.push(dataPoint ? dataPoint.amount : 0);
    });
    zMatrix.push(row);
  });

  const plotData = [
    {
      type: 'surface' as const,
      x: years,
      y: categories,
      z: zMatrix,
      colorscale: [
        [0, '#10b981'],    // Green for low values
        [0.5, '#f59e0b'],  // Orange for medium values
        [1, '#ef4444']     // Red for high values
      ],
      showscale: true,
      colorbar: {
        title: 'Amount ($)',
        titleside: 'right',
        tickformat: ',.0f',
        titlefont: { color: 'var(--foreground)' },
        tickfont: { color: 'var(--foreground)' }
      },
      hovertemplate: 
        '<b>%{y}</b><br>' +
        'Year: %{x}<br>' +
        'Amount: $%{z:,.0f}<br>' +
        '<extra></extra>',
      hoverongaps: false
    }
  ];

  const layout = {
    title: {
      text: '3D Spending Analysis by Category and Year',
      font: { size: 16, color: 'var(--foreground)' }
    },
    scene: {
      xaxis: {
        title: 'Years',
        titlefont: { color: 'var(--foreground)' },
        tickfont: { color: 'var(--foreground)' },
        gridcolor: 'var(--border)',
        tickmode: 'array',
        tickvals: years,
        ticktext: years.map(y => y.toString())
      },
      yaxis: {
        title: 'Categories',
        titlefont: { color: 'var(--foreground)' },
        tickfont: { color: 'var(--foreground)' },
        gridcolor: 'var(--border)',
        tickmode: 'array',
        tickvals: categories.map((_, i) => i),
        ticktext: categories
      },
      zaxis: {
        title: 'Amount ($)',
        titlefont: { color: 'var(--foreground)' },
        tickfont: { color: 'var(--foreground)' },
        gridcolor: 'var(--border)',
        tickformat: ',.0f'
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      },
      bgcolor: 'var(--background)'
    },
    width: width,
    height: height,
    paper_bgcolor: 'var(--background)',
    plot_bgcolor: 'var(--background)',
    font: {
      color: 'var(--foreground)'
    },
    margin: {
      l: 50,
      r: 100, // Extra space for colorbar
      b: 50,
      t: 50,
      pad: 4
    }
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true
  };

  return (
    <div className="w-full">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}