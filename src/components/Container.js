import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'
import request, { gql } from 'graphql-request';
import { formatDistance } from "date-fns";

const projectMetrics = gql`
query ($where: ProjectWhereUniqueInput!) {
  project(where: $where) {
    id 
    title
    metrics {
      cpu
      ram
      createdAt
    }
  }
}
`

const Container = ()=> {
  const { id } = useParams();

  const [project, setProject] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [cpuData, setCpuData] = useState({});
  const [ramData, setRamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let now = new Date()
 
  useEffect(() => {
    const fetchMetrics = async () => {
      try {

        const response = await request('http://localhost:3000/api/graphql', projectMetrics, {
          where: {id}
        });
        setProject(response.project.title)
        setMetrics(response.project.metrics);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  useEffect(() => {
    const cpuData = {
      labels: metrics.map(m => `${formatDistance(m.createdAt, now)} ago, at ${m.createdAt.slice(11,13)}`), 
      datasets: [{
        label: 'CPU Usage', 
        data: metrics.map(m => m.cpu),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 1,
      }],
    };

    const ramData = {
      labels: metrics.map(m => `${formatDistance(m.createdAt, now)} ago, at ${m.createdAt.slice(11,13)}`), 
      datasets: [{
        label: 'Memory Usage', 
        data: metrics.map(m => m.cpu),
        borderColor: 'rgba(192, 75,  192, 1)',
        backgroundColor: 'rgba(192, 75,  192, 0.6)',
        borderWidth: 1,
      }],
    };

    setCpuData(cpuData)
    setRamData(ramData)

  },[metrics])

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{backgroundColor: '#0F0D0E'}}>
      <h1 style={{color: 'lightgreen'}}>Dashboard Detail for {project}</h1>
      <Bar data={cpuData} style={{maxHeight: '300px', margin: '30px'}}/>
      <Bar data={ramData} style={{maxHeight: '300px', margin: '30px'}}/>
    </div>
  );
}

export default Container;
