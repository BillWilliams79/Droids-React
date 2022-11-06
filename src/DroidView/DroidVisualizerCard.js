// eslint-disable-next-line no-unused-vars
import varDump from '../classifier/classifier';

import React, { useState, useEffect, useContext} from 'react'
import call_rest_api from '../RestApi/RestApi';
import {SnackBar} from '../Components/SnackBar/SnackBar';

//import AuthContext from '../Context/AuthContext.js'
import AppContext from '../Context/AppContext';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { CircularProgress } from '@material-ui/core';

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Typography } from '@mui/material';

const DroidVisualizerCard = ({sensorDescription, sensorIndex, droidId }) => {

    // Task card is the list of tasks per area displayed in a card.
    //const { droidProfile } = useContext(AuthContext);
    const { droidsUri } = useContext(AppContext);

    // Array of task objects
    const [droidDataArray, setDroidDataArray] = useState()
    //const [droidApiTrigger, setDroidApiTrigger] = useState(false); 

    const [snackBarOpen, setSnackBarOpen] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [snackBarMessage, setSnackBarMessage] = useState('');

    console.count(`Render visualizer for sensor: ${sensorDescription.pretty_name}`)

    // READ Task API data for card
    useEffect( () => { 

        console.count('useEffect: read task API data for a given area');

        // create the start date string for the URI
        //var startDate = new Date();
        //startDate.setDate(startDate.getDate() - 5);
        //startDate.setHours(0,0,0,0);
        //var startDateString = startDate.toISOString().slice(0,19);

        // create the end date string for the URI
        //var endDate = new Date();
        //endDate.setDate(endDate.getDate() - 4);
        //endDate.setHours(0,0,0,0);
        //var endDateString = endDate.toISOString().slice(0,19);


        // FETCH TASKS: filter for creator, done=0 and area.id
        // QSPs limit fields to minimum: id,priority,done,description,area_fk
        //let droidDataUri = `${droidsUri}/${sensorDescription.endpoint}?droid_fk=${droidId}&filter_ts=(sample_time,${startDateString},${endDateString})`
        let droidDataUri = `${droidsUri}/${sensorDescription.endpoint}?droid_fk=${droidId}`
        varDump(droidDataUri, "computed URI")
        call_rest_api(droidDataUri, 'GET', '', null)
            .then(result => {

                if (result.httpStatus.httpStatus === 200) {

                    // Store Droid Data, but first trim excess precision
                    result.data = result.data.map((data) => { 
                        data.sample_time = data.sample_time.slice(5,10);
                        if ((sensorDescription.reading_column_name === 'temperature') ||
                            (sensorDescription.reading_column_name === 'relative_humidity') ||
                            (sensorDescription.reading_column_name === 'soil_temperature') ||
                            (sensorDescription.reading_column_name === 'uv_index')) {
                            data[sensorDescription.reading_column_name] = data[sensorDescription.reading_column_name].toPrecision(3);
                        }
                        return data;
                    })

                    setDroidDataArray(result.data);

                } else {

                    varDump(result.httpStatus, `DroidVisualizerCard UseEffect: error retrieving sensor data ${sensorDescription.pretty_name}`);
                }  

            }).catch(error => {

                if (error.httpStatus.httpStatus === 404) {

                    // 404 = no data for this sensor, leave a blank array
                    setDroidDataArray([]);

                } else {
                    varDump(error, `DroidVisualizerCard UseEffect: error retrieving sensor data ${sensorDescription.pretty_name}`);
                }
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <Box sx={{backgroundColor: 'beige'}}>
                <Typography variant="caption" component='p'>
                {label}
                </Typography>
                <Typography variant="caption">
                {`${sensorDescription.reading_units} : ${payload[0].value}`}
                </Typography>
            </Box>

          );
        }
      
        return null;
      };

    return (
        <Card key={sensorDescription.endpoint} raised={true} >
            <CardContent>
                <Box className="card-header" sx={{marginBottom: 2}}>
                    <Typography key={`sensorName-${sensorDescription.endpoint}`}
                                variant="h5">
                        {sensorDescription.pretty_name || ''}
                    </Typography>

                </Box>
                { droidDataArray ?
                    (droidDataArray.length) ?
                      <ResponsiveContainer width={'100%'} aspect={1}>
                        <LineChart data={droidDataArray}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Line type="monotone" isAnimationActive={false} dataKey={sensorDescription.reading_column_name} />
                            <XAxis dataKey="sample_time"/>
                            <YAxis label={{ value: sensorDescription.reading_units, angle: -90, position: 'insideLeft' }}/>
                            <Tooltip content={<CustomTooltip sensorDescription={sensorDescription}/>}/>
                        </LineChart>
                      </ResponsiveContainer>
                    :
                      <Typography>
                        No data available for selected time frame
                      </Typography>
                  :
                    <CircularProgress/>
                }
            </CardContent>
            <SnackBar {...{snackBarOpen,
                           setSnackBarOpen,
                           snackBarMessage,}} />
        </Card>
    )
}

export default DroidVisualizerCard