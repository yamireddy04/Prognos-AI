import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  labels: string[];
  probabilities: number[];
  predictionIndex: number;
}

const BAR_COLORS = ['#1a56db', '#0d9488', '#d97706', '#e11d48', '#7c3aed'];

export function ProbabilityChart({ labels, probabilities, predictionIndex }: Props) {
  const data = labels.map((label, i) => ({
    label: label.length > 13 ? label.slice(0, 12) + '…' : label,
    probability: Math.round(probabilities[i] * 100),
    full: label,
    index: i,
  }));

  return (
    <ResponsiveContainer width="100%" height={155}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
        barSize={32}
        barCategoryGap="25%"
      >
        <XAxis
          dataKey="label"
          tick={{ fill: '#9aa3b0', fontSize: 11, fontFamily: 'Instrument Sans' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9aa3b0', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: '1px solid #e2e6ec',
            borderRadius: 10,
            fontSize: 12,
            color: '#374151',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontFamily: 'Instrument Sans',
          }}
          formatter={(val: number, _: string, props: any) => [`${val}%`, props.payload.full]}
          cursor={{ fill: 'rgba(26,86,219,0.04)' }}
        />
        <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={i === predictionIndex ? BAR_COLORS[i % BAR_COLORS.length] : '#e2e6ec'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}