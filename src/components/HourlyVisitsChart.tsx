import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HourlyVisitsChartProps {
  hourlyData: Array<{
    hour: number;
    count: number;
  }>;
}

export default function HourlyVisitsChart({ hourlyData }: HourlyVisitsChartProps) {
  // Get max count for gradient calculation
  const maxCount = Math.max(...hourlyData.map(item => item.count), 1);

  // Format labels (0-23 hours)
  const labels = hourlyData.map(item => {
    const hour = item.hour;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Generate gradient colors based on count (higher = darker orange)
  const getBarColor = (count: number) => {
    if (count === 0) return 'rgba(241, 245, 249, 0.5)';
    const intensity = count / maxCount;
    const alpha = 0.6 + (intensity * 0.4); // 0.6 to 1.0
    return `rgba(240, 90, 40, ${alpha})`;
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Lượt truy cập',
        data: hourlyData.map(item => item.count),
        backgroundColor: hourlyData.map(item => getBarColor(item.count)),
        borderColor: '#F05A28',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 13
        },
        borderColor: '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const hour = hourlyData[index].hour;
            return `Giờ ${hour}:00 - ${hour + 1}:00`;
          },
          label: (context: any) => {
            return `Lượt truy cập: ${context.parsed.y.toLocaleString('vi-VN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#64748B',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F1F5F9'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#64748B',
          callback: function(value: any) {
            return value.toLocaleString('vi-VN');
          }
        }
      }
    }
  };

  if (hourlyData.length === 0 || maxCount === 0) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        color: '#94A3B8',
        background: '#F8FAFC',
        borderRadius: '8px'
      }}>
        Chưa có dữ liệu để hiển thị biểu đồ
      </div>
    );
  }

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
