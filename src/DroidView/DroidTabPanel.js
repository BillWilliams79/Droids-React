// eslint-disable-next-line no-unused-vars
import varDump from '../classifier/classifier';
import AuthContext from '../Context/AuthContext.js'
import AppContext from '../Context/AppContext';
import call_rest_api from '../RestApi/RestApi';

import React, {useState, useEffect, useContext} from 'react';

import {SnackBar} from '../Components/SnackBar/SnackBar';

//import AuthContext from '../Context/AuthContext.js'
//import AppContext from '../Context/AppContext';

import { Box } from '@mui/system';
import { TabPanel } from '@material-ui/lab';
import { CircularProgress } from '@mui/material';
import DroidVisualizerCard from './DroidVisualizerCard';

const DroidTabPanel = ( { droid, droidIndex } ) => {

    const { droidProfile, idToken } = useContext(AuthContext);
    const { droidsUri } = useContext(AppContext);

    const [sensorDescriptioinArray, setSensorDescriptioinArray] = useState()

    // snackBar state
    const [snackBarOpen, setSnackBarOpen] = useState(false);

    // eslint-disable-next-line no-unused-vars  
    const [snackBarMessage, setSnackBarMessage] = useState('');


    // READ AREA API data for TabPanel
    useEffect( () => { 

        console.count('useEffect: read all Rest API data');

/*         // TODO - droids needs a list of attached sensors that we can correlate to table data and read into the
        // cards
        setSensorDescriptioinArray([{name: 'temperature', dataPoint: 'temperature', displayName: 'Air Temperature'},
                         {name: 'relative_humidity', dataPoint: 'relative_humidity', displayName: 'Relative Humidity'},
                         {name: 'soil_temperature', dataPoint: 'soil_temperature', displayName: 'Soil Temperature'},
                         {name: 'soil_moisture', dataPoint: 'soil_moisture', displayName: 'Soil Moisture'},
                         {name: 'uv', dataPoint: 'uv_index', displayName: 'UV Index'},
                         {name: 'rssi', dataPoint: 'rssi', displayName: 'RSSI'},
                       ]); */

        let sensorDescriptionUri = `${droidsUri}/sensor_description?droid_fk=${droid.id}`;

        call_rest_api(sensorDescriptionUri, 'GET', '', idToken)
            .then(result => {
                
                setSensorDescriptioinArray(result.data);

            }).catch(error => {
                varDump(error, `UseEffect: error retrieving Areas: ${error}`);
            });
 
    }, [setSensorDescriptioinArray]);

    return (
            <TabPanel key={droidIndex} value={droidIndex.toString()} 
                      className="app-content-tabpanel"
            >
                { sensorDescriptioinArray ? 
                    <Box className="card">
                        { sensorDescriptioinArray.map((sensorDescription, sensorIndex) => (
                             <DroidVisualizerCard key = {sensorDescription}
                                                  sensorDescription = {{...sensorDescription}}
                                                  droidId = {droid.id}
                            />
                        ))}
                    </Box>
                  :
                    <CircularProgress/>
                }
                <SnackBar {...{snackBarOpen,
                               setSnackBarOpen,
                               snackBarMessage,}} />
            </TabPanel>
    )
}

export default DroidTabPanel