import varDump from '../classifier/classifier';

// make this a rest api call library that has no UI side effects.
// eventually replace with react-router or similar

const call_rest_api = async (url, method, body, idToken) => {

    //varDump({url, method, body, idToken}, 'call_rest_api parameters');

    // STEP 1 - construct a fetch init object, processing body
    // and incorporating any auth tokens
    const fetchInit = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
    };
    fetchInit['body'] = (body) ? JSON.stringify(body) : null;

    if (idToken) {
        fetchInit['headers']['Authorization'] = idToken;
    }

    // STEP 2, perform fetch and catch the http status not between 200 and 499
    try {
        //varDump({url, fetchInit}, 'Call Fetch Parameters: call_rest_api');
        var response = await fetch(url, fetchInit)
    } catch (error) {
        console.log(`call_rest_api failed with following message: ${error}`);
        const errorReturn = {
            data: {},
            httpStatus: { httpMethod: fetchInit.method,
                               httpStatus: 503,
                               httpMessage: 'SERVICE UNAVAILABLE',},
        };
        return errorReturn;
    };

    // STEP 3 wait for JSON data and parse into javascript
    if (response.status !== 204) {
        // 204 is a No Content response and independent of what is returned from api lambda
        // gives an error retrieving the json data. So skip it!
        try {
            const jsonData = await response.json();
            var data = (jsonData.length > 0) ? JSON.parse(jsonData) : '';
        } catch (error) {
            varDump(error, 'Error retrieving response.json')
        }
    }

    // STEP 4 construct responseData object and return it
    var httpStatus = {httpMethod: fetchInit.method,
                      httpStatus: response.status,
                      httpMessage: '',
    };

    // Generate httpMessage based on HTTP status
    if (response.status === 200) {
        httpStatus.httpMessage = 'OK';
    } else if (response.status === 201) {
        httpStatus.httpMessage = 'CREATED';
    } else if (response.status === 204) {
        httpStatus.httpMessage = 'NO CONTENT';
    } else {
        // there is some form of error, in which case the data returned
        // is actually the error message, unpleasant overload for now
        httpStatus.httpMessage = data;
        data = null;
        // eslint-disable-next-line  no-throw-literal
        throw {data, httpStatus}
    }

    const returnValue = {
        data,
        httpStatus,
    };

    //varDump(returnValue, "Return Fetch Data: call_rest_api");

    return returnValue;
}

export default call_rest_api
