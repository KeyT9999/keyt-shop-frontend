import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyVisitsChartProps {
  dailyData: Array<{
    date: string;
    count: number;
  }>;
}

export default function DailyVisitsChart({ dailyData }: DailyVisitsChartProps) {
  // Format dates for display (DD/MM)
  const labels = dailyData.map(item => {
    const date = new Date(item.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Lượt truy cập',
        data: dailyData.map(item => item.count),
        borderColor: '#F05A28',
        backgroundColor: 'rgba(240, 90, 40, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#F05A28',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
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
            const fullDate = new Date(dailyData[index].date);
            return fullDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
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
            size: 11
          },
          color: '#64748B'
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

  if (dailyData.length === 0) {
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
      <Line data={data} options={options} />
    </div>
  );
}
