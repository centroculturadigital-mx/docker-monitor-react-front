import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request, gql } from 'graphql-request';

const projectsQuery = gql`
  query {
    projects {
      id
      title
    }
  }
`;

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await request('https://test.centroculturadigital.mx/api/graphql', projectsQuery);
        setProjects(response.projects);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{backgroundColor: '#0F0D0E'}}>
      <h1 style={{color: 'lightgreen'}}>Dashboard</h1>
      <ul>
        {projects.length > 0 ? (
          projects.map((p) => (
            <li key={p.id} style={{color: 'lightpink'}}>
              <Link to={`/dashboard/${p.id}`}>{p.title}</Link>
            </li>
          ))
        ) : (
          <li>No projects found</li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
