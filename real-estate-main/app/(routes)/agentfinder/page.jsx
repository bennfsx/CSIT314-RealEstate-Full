'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import Image from 'next/image';

function AgentFinder() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      let { data: agents, error } = await supabase.from('agents').select('*');

      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        setAgents(agents);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6 mt-4">Agents Near You 📍</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-center gap-4">
              <Image
                src={agent.agent_image}
                alt="profileImage"
                width={150}
                height={150}
                className="rounded-2xl"
              />
              <div>
                <h2 className="text-xl font-bold">{agent.agent_name}</h2>
                <p className="text-gray-500">{agent.agent_description}</p>
                <p className="text-gray-700 mt-2">
                  License: {agent.agent_license}
                </p>
                <p className="text-gray-700">Contact: {agent.agent_phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentFinder;
