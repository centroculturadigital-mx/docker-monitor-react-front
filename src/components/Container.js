import React from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'

function Container() {
  const { id } = useParams();

  const data = [
    {year: 2010, count:10}, 
    { year: 2011, count: 20 },
    { year: 2012, count: 15 }, 
    {year: 2013,count: 25}, 
    { year: 2014, count: 22 },
    { year: 2015, count: 30 }, 
    {year:2016, count: 28}
]; 

  const chartData = {
    labels: data.map(row => row.year), 
    datasets: [{
      label: 'Acquisitions by year', 
      data: data.map(row => row.count),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderWidth: 1,
    }],
  };

  return (
    <div>
      <h1>Dashboard Detail for Item {id}</h1>
      <p>Details about item {id}.</p>
      <Bar data={chartData} />
    </div>
  );
}

export default Container;
