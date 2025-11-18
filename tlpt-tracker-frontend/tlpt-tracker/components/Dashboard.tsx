
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project, Team, SubTaskStatus } from '../types';

interface DashboardProps {
    project: Project;
}

const PieChartComponent = ({ data, title, colors }: { data: any[], title: string, colors: string[] }) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    if (total === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                <h3 className="text-xl font-semibold mb-4 text-text-primary">{title}</h3>
                <div className="h-64 flex items-center justify-center text-text-secondary">
                    <p>No tasks found.</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="flex-1 flex flex-col items-center min-w-0">
            <h3 className="text-xl font-semibold mb-4 text-text-primary">{title}</h3>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                if (percent === 0) return null;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                             contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                             formatter={(value, name) => [`${value} tasks`, name]}
                        />
                        <Legend iconSize={10} wrapperStyle={{ color: '#9ca3af', fontSize: '14px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

const Dashboard: React.FC<DashboardProps> = ({ project }) => {
    const { tiData, rtData } = useMemo(() => {
        const calculateTeamData = (team: Team) => {
            const teamTasks = project.tasks.filter(task => task.category === team);
            const allSubTasks = teamTasks.flatMap(task => task.subCategories.flatMap(sc => sc.subTasks));
            const total = allSubTasks.length;
            const completed = allSubTasks.filter(st => st.status === SubTaskStatus.COMPLETED || st.status === SubTaskStatus.NOT_APPLICABLE).length;
            const pending = total - completed;

            return [
                { name: 'Completed', value: completed },
                { name: 'Pending', value: pending },
            ];
        };

        return {
            tiData: calculateTeamData(Team.THREAT_INTEL),
            rtData: calculateTeamData(Team.RED_TEAM),
        };
    }, [project]);
    
    const PIE_COLORS = ['#10b981', '#f59e0b']; // Completed, Pending
    const totalTasks = project.tasks.flatMap(t => t.subCategories.flatMap(sc => sc.subTasks)).length;

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-text-primary">Project Dashboard</h2>
            {totalTasks === 0 ? (
                <div className="text-center py-10 text-text-secondary">
                    <p>No tasks added to the project yet. Add tasks to see progress.</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row -mx-4">
                    <PieChartComponent data={tiData} title="Threat Intelligence" colors={PIE_COLORS} />
                    <PieChartComponent data={rtData} title="Red Team" colors={PIE_COLORS} />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
