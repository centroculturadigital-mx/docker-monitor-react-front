import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'
import request, { gql } from 'graphql-request';
import { format, formatDistance } from "date-fns";
const { es } = require('date-fns/locale')

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

const groubByDay = (metrics, resource) => {
  return metrics.reduce((acc, obj) => {
    const date = new Date(obj.createdAt);
    const day = date.toISOString().split('T')[0]; // Get date part in YYYY-MM-DD format

    if (!acc[day]) {
        acc[day] = [];
    }
    acc[day].push(obj[resource]);
    return acc;
}, {});
}

const Container = ()=> {
  const { id } = useParams();

  const [project, setProject] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [cpuData, setCpuData] = useState({});
  const [ramData, setRamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dataFormat, setDataFormat] = useState('byDay')

  let now = new Date()
 
  useEffect(() => {
    const fetchMetrics = async () => {
      try {

        const response = await request('https://test.centroculturadigital.mx/api/graphql', projectMetrics, {
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

   if (metrics.length) { 
    
      let labels = []
      let cpuDataSet = []
      let ramDataSet = []
      const now = new Date()
      if (dataFormat == "byDay") {
        const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const lastMetrics = metrics.filter(m => {
          const createdAtDate = new Date(m.createdAt);
          return createdAtDate >= last30Days;
        })
        const cpuGrouped = groubByDay(lastMetrics,'cpu')
        const ramGrouped = groubByDay(lastMetrics,'ram')
        cpuDataSet = Object.entries(cpuGrouped).map(ent => ent[1].reduce((acc , m)=> acc+=m, 0)/ ent[1].length)
        ramDataSet = Object.entries(ramGrouped).map(ent => ent[1].reduce((acc , m)=> acc+=m, 0)/ ent[1].length)
        labels = Object.keys(cpuGrouped).map( d => format(d, 'eee, dd MMM', {locale: es}))
      } else {

        const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        let lastMetrics = metrics.filter(m => {
          const createdAtDate = new Date(m.createdAt);
          return createdAtDate >= last24Hours;
        })
        if (lastMetrics.length == 0) {
          lastMetrics = metrics.slice(-24)
        }
        cpuDataSet = lastMetrics.map(lm => lm.cpu)
        ramDataSet = lastMetrics.map(lm => lm.ram)
        labels = lastMetrics.map(m => format(m.createdAt, 'h a'))
      }
 
      const cpuData = {
        labels, 
        datasets: [{
          label: 'CPU Usage', 
          data: cpuDataSet,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: function(context) {
            const value = context.dataset.data[context.dataIndex];
            return value > 10 ? 'red' : 'rgba(75, 192, 192, 0.6)';
          },
          borderWidth: 1,
        }],
      };

      const ramData = {
        labels, 
        datasets: [{
          label: 'Memory Usage', 
          data: ramDataSet,
          borderColor: 'rgba(192, 75,  192, 1)',
          backgroundColor: function(context) {
            const value = context.dataset.data[context.dataIndex];
            return value > 30 ? 'red' : 'rgba(192, 75,  192, 0.6)';
          },
          borderWidth: 1,
        }],
      };

      setCpuData(cpuData)
      setRamData(ramData)
    }

  },[metrics, dataFormat])

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleDataFormatChange = (event) => {
    setDataFormat(event.target.value);
  };

  return (
    <div>
      <h1 style={{color: 'lightgreen'}}>Uso de recursos para {project}</h1>
      <select onChange={handleDataFormatChange} value={dataFormat}>
        <option value="byDay">Promedio por día (últimos 30 días)</option>
        <option value="byHour">Valor por hora (últimas 24 hrs)</option>
      </select>
      <Bar data={cpuData} style={{maxHeight: '300px', margin: '30px'}}/>
      <Bar data={ramData} style={{maxHeight: '300px', margin: '30px'}}/>
    </div>
  );
}

export default Container;
