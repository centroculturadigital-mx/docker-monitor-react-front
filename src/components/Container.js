import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'
import request, { gql } from 'graphql-request';
import { addDays, format, formatDistance, subDays } from "date-fns";
import { es } from 'date-fns/locale';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const projectMetrics = gql`
query ($where: ProjectWhereUniqueInput!, $whereMetrics: MetricWhereInput) {
  project(where: $where) {
    id 
    title
    container
    url
    metrics (where: $whereMetrics) {
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

  const [pickingAvgOrByHour, setPickingAvgOrByHour] = useState(false)
  const [pickingDays, setPickingDays] = useState(false)
  const [averageSelected, setAverageSelected] = useState(false)
  const [byHourSelected, setByHourSelected] = useState(false)
  const [daySelected, setDaySelected] = useState(subDays(new Date(), 31))
  const [endDaySelected, setEndDaySelected] = useState(new Date())
  const [containerTag, setContainerTag] = useState(null)
  const [containerUpdatedDate, setContainerUpdatedDate] = useState(null)

  const [project, setProject] = useState('');
  const [url, setUrl] = useState('');
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

        let whereMetrics = {
          AND: [
            {
              createdAt: {
                gt: daySelected.toISOString()
              }
            }, {
              createdAt: {
                lte: endDaySelected ||addDays(daySelected, 1).toISOString()
              }
            }
        ]
        }
        const response = await request('https://test.centroculturadigital.mx/api/graphql', projectMetrics, {
        // const response = await request('http://localhost:3000/api/graphql', projectMetrics, {
          where: {id},
          whereMetrics
        });

        

        
        setProject(response.project?.title || 'title')
        setUrl(response.project?.url || '#')
        setMetrics(response.project?.metrics || []);
        setLoading(false);
        // const response2 = (await (await fetch('http://localhost:3003/api/' + response.project.container)).json()).data
        const response2 = (await (await fetch('https://test.centroculturadigital.mx/docker/' + response.project.container)).json()).data
        if (response2) {
          console.log('response2', response2.State.StartedAt);
          setContainerTag(response2.Config.Image.split(':')[1])
          setContainerUpdatedDate(formatDistance(new Date(response2.State.StartedAt), new Date(), {locale: es}))
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [daySelected, endDaySelected, id]);

  useEffect(() => {

   if (metrics.length > 0) { 
      let labels = []
      let cpuDataSet = []
      let ramDataSet = []
      const now = new Date()
      if (dataFormat == "byDay") {
        const cpuGrouped = groubByDay(metrics,'cpu')
        const ramGrouped = groubByDay(metrics,'ram')
        cpuDataSet = Object.entries(cpuGrouped).map(ent => ent[1].reduce((acc , m)=> acc+=m, 0)/ ent[1].length)
        ramDataSet = Object.entries(ramGrouped).map(ent => ent[1].reduce((acc , m)=> acc+=m, 0)/ ent[1].length)
        labels = Object.keys(cpuGrouped).map( d => format(d, 'eee, dd MMM', {locale: es}))
      } else {
        cpuDataSet = metrics.map(lm => lm.cpu)
        ramDataSet = metrics.map(lm => lm.ram)
        labels = metrics.map(m => format(m.createdAt, 'h a'))
      }
 
      const cpuData = {
        labels, 
        datasets: [{
          label: 'CPU', 
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
          label: 'Memoria', 
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
    { pickingAvgOrByHour ?
        <div style={{height: "60vh", display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
          <button
           onClick={() => {setPickingAvgOrByHour(false); setByHourSelected(false); setAverageSelected(true); setPickingDays(true)}}
           style={{padding: "20px", fontWeight: 'bold', backgroundColor: "#cae797", color: '#2b2d3d'}}
          >Ver promedio por día en rango de fechas</button>
          <button
           onClick={() => {setPickingAvgOrByHour(false); setAverageSelected(false); setByHourSelected(true); setPickingDays(true)}}
           style={{padding: "20px", fontWeight: 'bold', backgroundColor: "#cae797", color: '#2b2d3d'}}
          >Ver mediciones por hora de un día</button>
        </div>
      : 
      ( pickingDays && (averageSelected || byHourSelected) ? 
        <div style={{height: "60vh", display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
          <DayPicker
            mode="single"
            selected={daySelected}
            onSelect={(s) => {
              setDaySelected(s)
              if (byHourSelected) {
                setEndDaySelected(addDays(s, 1))
                setDataFormat('byHour')
                setPickingDays(false)
              }
            }}
            footer={
              averageSelected ? "Select initial date" : "Select a day"
            }
          />
          {
            averageSelected && 
            <DayPicker
              mode="single"
              selected={endDaySelected}
              onSelect={(s) => {
                setEndDaySelected(s)
                setPickingDays(false)
              }}
              footer="Select ending date"
            />
          }
        </div>
        :
        <div style={{paddingBottom: "50px", margin: "30px"}}>
                    <h1 className="title" style={{color: "#cae797", display: "grid"}}>
                      <span style={{backgroundColor: '#bf94e4', display: 'flex', alignItems: "center"}}>
                        <span style={{padding: '0 5px'}}>{project} </span>
                        <img style={{height: "30px", margin: "0 20px"}} src="/dashboard/dobleArrow.png" alt="arrow" />
                        <a style={{fontSize: '0.8rem', color: "#cae797" }} href={url} rel="noreferrer" target="_blank">{url ? url.replace(/^https?:\/\//, ''): ''} [↗]</a>
                        <button style={{color: "#2b2d3d", background: "#cae797", border: "none", height: "100%", margin: "0 10px", padding: "0 10px"}} onClick={() => setPickingAvgOrByHour(true)}>Ver fechas anteriores</button>
                      </span>
                    </h1>
                    <p>
                      Tag: {containerTag}, corriendo desde: {containerUpdatedDate}
                    </p>
        <div className='select'>  
            <select  onChange={handleDataFormatChange} value={dataFormat}>
              <option value="byDay">Promedio por día</option>
              <option value="byHour">Valor por hora </option>
            </select>
            <div class="select_arrow"></div>
          </div>
          <p>{format(daySelected, 'dd MMM')} {dataFormat == 'byHour' ? '' : `- ${format(endDaySelected, 'dd MMM')}`} </p>
          <p>Registro del uso de CPU y Memoria de la página del centro de cultura digital, en los últimos 30 días.</p>
          <div><h2 style={{display: "inline", backgroundColor: "#cae797", color: "black",  fontSize: "1rem", padding: "5px"}}>Uso de CPU</h2></div>
            {cpuData  && <Bar data={cpuData} style={{maxHeight: '300px', margin: '30px'}}/>}
            <p>{`~> CPU === Se refiere a la cantidad de capacidad de procesamiento que está siendo utilizada en un momento dado. Es una métrica importante para monitorear, ya que puede indicar cuán intensamente está siendo utilizado el servidor`}</p>

          <div><h2 style={{display: "inline", backgroundColor: "#cae797", color: "black", fontSize: "1rem", padding: "5px"}}>Uso de Memoria</h2></div>
            {ramData && <Bar data={ramData} style={{maxHeight: '300px', margin: '30px'}}/>}
            <p>{`~> RAM === Se refiere a la cantidad de memoria RAM que está siendo utilizada en un momento dado. Al igual que con el uso de la CPU, el uso de la memoria es una métrica crucial para monitorear, ya que impacta directamente en el rendimiento del servidor`}</p>
        </div>)
    }
  </div>
  );
}


export default Container;