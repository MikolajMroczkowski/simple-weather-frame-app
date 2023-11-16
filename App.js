import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View, Image,ToastAndroid} from 'react-native';
import {useEffect, useState} from "react";
import * as Location from 'expo-location';

const weekDays = ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek", "Sobota"]
export default function App() {
    const toNormalFormat = (data) => {
        return data.toString().length === 1 ? "0"+data.toString() : data
    }
    const [time, setTime] = useState("")
    const [date, setDate] = useState("DUPA")
    const [city, setCity] = useState("DUPA")
    const [description, setDescription] = useState("DUPA")
    const [windSpeed, setWindSpeed] = useState(0)
    const [windDirection, setWindDirection] = useState(0)
    const [pressure, setPressure] = useState(0)
    const [precipitationProbability, setPrecipitationProbability] = useState(0)
    const [temp, setTemp] = useState(69)
    const [iconUrl, setIconUrl] = useState("http://openweathermap.org/img/wn/01d.png")
    const [location, setLocation] = useState({latitude: 0, longitude: 0})
    const [sunrise, setSunrise] = useState(new Date())
    const [sunset, setSunset] = useState(new Date())
    setTimeout(() => {
        const a = new Date()
        setTime(`${toNormalFormat(a.getHours())}:${toNormalFormat(a.getMinutes())}:${toNormalFormat(a.getSeconds())}`)
        setDate(`${weekDays[a.getDay()]}, ${toNormalFormat(a.getDate())}.${toNormalFormat(a.getMonth()+1)}.${a.getFullYear()}`)
    }, 1000);
    const getLocation = () => {
        Location.requestForegroundPermissionsAsync().then((permission) => {
            if (permission.status !== 'granted') {
                setCity("Permission to access location was denied");
            } else {
                Location.getCurrentPositionAsync().then((pos) => {
                    console.log(pos.coords.latitude, pos.coords.longitude);
                    setLocation({latitude: pos.coords.latitude, longitude: pos.coords.longitude})
                    Location.reverseGeocodeAsync({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    }).then((res) => {
                        setCity(res[0].city)
                        ToastAndroid.show("Pobrano lokalizację", ToastAndroid.SHORT)
                    });
                });
            }
        });
    }
    useEffect(() => {
        setInterval(() => {
            getLocation()
        },360000)
        setInterval(() => {
          getWeather()
        },300000)
    }, []);
    useEffect(() => {
        getWeather()
    },[location])
    const getWeather = () => {
        if(location.latitude === 0 && location.longitude === 0) {
            console.log("DISABLING")
            getLocation()
            return
        }
        console.log(location.latitude, location.longitude)
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,is_day,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability&daily=sunrise,sunset&forecast_days=1`)
            .then(response => response.json())
            .then((data) => {
                console.log(data)
                setTemp(data.current.temperature_2m)
                const weatherCode = data.current.weather_code
                const isDay = data.current.is_day === 1
                if (isDay) {
                    setIconUrl(dictionary[weatherCode].day.image)
                    setDescription(dictionary[weatherCode].day.description)
                } else {
                    setIconUrl(dictionary[weatherCode].night.image)
                    setDescription(dictionary[weatherCode].night.description)
                }
                const currentHour = new Date().getHours()
                setWindSpeed(data.current.wind_speed_10m)
                setWindDirection(data.current.wind_direction_10m)
                const gtmSunrise = new Date(data.daily.sunrise[0])
                setSunrise(new Date(gtmSunrise.getTime() + (new Date().getTimezoneOffset()*-1)*60000))
                const gtmSunset = new Date(data.daily.sunset[0])
                setSunset(new Date(gtmSunset.getTime() + (new Date().getTimezoneOffset()*-1)*60000))
                setPrecipitationProbability(data.hourly.precipitation_probability[currentHour])
                setPressure(data.current.surface_pressure)
                ToastAndroid.show("Pobrano dane pogodowe", ToastAndroid.SHORT)
            });
    }
    return (
        <View style={styles.container} onTouchStart={getWeather}>
            <View style={styles.view}>
                <Text style={styles.dir}>N</Text>
                <Text style={{fontSize:50,fontWeight:'900',color:'#fff',transform:[{rotate:windDirection+"deg"}]}}>↑</Text>
                <Text style={styles.pressure}>{windSpeed} km/h</Text>
                <Text style={styles.pressure}>{pressure} hPa</Text>
                <Text style={styles.sunrise}>{toNormalFormat(sunrise.getHours())}:{toNormalFormat(sunrise.getMinutes())} - {toNormalFormat(sunset.getHours())}:{toNormalFormat(sunset.getMinutes())} </Text>
            </View>
            <View style={styles.view}>
                <Text style={styles.clock}>{time}</Text>
                <Text style={styles.date}>{date}</Text>
                <Text style={styles.city}>{city}</Text>
            </View>
            <View style={styles.view}>
                <Image
                    style={styles.icon}
                    source={{uri: iconUrl}}
                />
                <Text style={styles.desc}>{description}</Text>
                <Text style={styles.rain}>Opday: {precipitationProbability} %</Text>
                <Text style={styles.temp}>{temp} °C</Text>
            </View>
            <StatusBar style="auto"/>
            <Text style={styles.watermark}>Dane dostarcza open-meteo.com</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    view: {
        width: '33%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#19646e',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dir: {
        color: 'rgb(246,114,114)',
        fontSize: 25,
    },
    clock: {
        color: '#ffffff',
        fontSize: 74,
    },
    date: {
        color: '#ffffff',
        fontSize: 35,
    },
    city: {
        color: '#ffffff',
        fontSize: 25,
    },
    temp: {
        color: '#ffffff',
        fontSize: 40,
    },
    pressure: {
      color: '#ffffff',
        fontSize: 40,
    },
    sunrise: {
        color: '#ffffff',
        fontSize: 27,
        fontWeight: 'bold',
    },
    rain: {
        color: '#ffffff',
        fontSize: 30,
    },
    desc: {
        color: '#ffffff',
        fontSize: 27,
    },
    icon: {
        width: 100,
        height: 100,
    },
    watermark:{
        position: 'absolute',
        bottom: 0,
        right: 0,
        color: 'rgba(255,255,255,0.62)',
        fontSize: 10,
    }
})

const dictionary = {
    "0": {
        "day": {
            "description": "Słonecznie",
            "image": "http://openweathermap.org/img/wn/01d@2x.png"
        },
        "night": {
            "description": "Bezchmurnie",
            "image": "http://openweathermap.org/img/wn/01n@2x.png"
        }
    },
    "1": {
        "day": {
            "description": "Głównie słonecznie",
            "image": "http://openweathermap.org/img/wn/01d@2x.png"
        },
        "night": {
            "description": "Głównie bezchmurnie",
            "image": "http://openweathermap.org/img/wn/01n@2x.png"
        }
    },
    "2": {
        "day": {
            "description": "Częściowo zachmurzone",
            "image": "http://openweathermap.org/img/wn/02d@2x.png"
        },
        "night": {
            "description": "Częściowo zachmurzone",
            "image": "http://openweathermap.org/img/wn/02n@2x.png"
        }
    },
    "3": {
        "day": {
            "description": "Zachmurzone",
            "image": "http://openweathermap.org/img/wn/03d@2x.png"
        },
        "night": {
            "description": "Zachmurzone",
            "image": "http://openweathermap.org/img/wn/03n@2x.png"
        }
    },
    "45": {
        "day": {
            "description": "Mglisto",
            "image": "http://openweathermap.org/img/wn/50d@2x.png"
        },
        "night": {
            "description": "Mglisto",
            "image": "http://openweathermap.org/img/wn/50n@2x.png"
        }
    },
    "48": {
        "day": {
            "description": "Mroźna mgła",
            "image": "http://openweathermap.org/img/wn/50d@2x.png"
        },
        "night": {
            "description": "Mroźna mgła",
            "image": "http://openweathermap.org/img/wn/50n@2x.png"
        }
    },
    "51": {
        "day": {
            "description": "Lekka mżawka",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Lekka mżawka",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "53": {
        "day": {
            "description": "Mżawka",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Mżawka",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "55": {
        "day": {
            "description": "Intensywna mżawka",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Intensywna mżawka",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "56": {
        "day": {
            "description": "Lekki marznący deszcz",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Lekki marznący deszcz",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "57": {
        "day": {
            "description": "Marznący deszcz",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Marznący deszcz",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "61": {
        "day": {
            "description": "Lekki deszcz",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "night": {
            "description": "Lekki deszcz",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "63": {
        "day": {
            "description": "Deszcz",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "night": {
            "description": "Deszcz",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "65": {
        "day": {
            "description": "Intensywny deszcz",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "night": {
            "description": "Intensywny deszcz",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "66": {
        "day": {
            "description": "Lekki marznący deszcz",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "night": {
            "description": "Lekki marznący deszcz",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "67": {
        "day": {
            "description": "Marznący deszcz",
            "image": "http://openweathermap.org/img/wn/10d@2x.png"
        },
        "night": {
            "description": "Marznący deszcz",
            "image": "http://openweathermap.org/img/wn/10n@2x.png"
        }
    },
    "71": {
        "day": {
            "description": "Lekki śnieg",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "night": {
            "description": "Lekki śnieg",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "73": {
        "day": {
            "description": "Śnieg",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "night": {
            "description": "Śnieg",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "75": {
        "day": {
            "description": "Intensywny śnieg",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "night": {
            "description": "Intensywny śnieg",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "77": {
        "day": {
            "description": "Śnieg drobny",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "night": {
            "description": "Śnieg drobny",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "80": {
        "day": {
            "description": "Lekkie opady deszczu",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Lekkie opady deszczu",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "81": {
        "day": {
            "description": "Opady deszczu",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Opady deszczu",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "82": {
        "day": {
            "description": "Intensywne opady deszczu",
            "image": "http://openweathermap.org/img/wn/09d@2x.png"
        },
        "night": {
            "description": "Intensywne opady deszczu",
            "image": "http://openweathermap.org/img/wn/09n@2x.png"
        }
    },
    "85": {
        "day": {
            "description": "Lekkie opady śniegu",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "night": {
            "description": "Lekkie opady śniegu",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "86": {
        "day": {
            "description": "Opady śniegu",
            "image": "http://openweathermap.org/img/wn/13d@2x.png"
        },
        "night": {
            "description": "Opady śniegu",
            "image": "http://openweathermap.org/img/wn/13n@2x.png"
        }
    },
    "95": {
        "day": {
            "description": "Burza",
            "image": "http://openweathermap.org/img/wn/11d@2x.png"
        },
        "night": {
            "description": "Burza",
            "image": "http://openweathermap.org/img/wn/11n@2x.png"
        }
    },
    "96": {
        "day": {
            "description": "Lekkie burze z gradem",
            "image": "http://openweathermap.org/img/wn/11d@2x.png"
        },
        "night": {
            "description": "Lekkie burze z gradem",
            "image": "http://openweathermap.org/img/wn/11n@2x.png"
        }
    },
    "99": {
        "day": {
            "description": "Burza z gradem",
            "image": "http://openweathermap.org/img/wn/11d@2x.png"
        },
        "night": {
            "description": "Burza z gradem",
            "image": "http://openweathermap.org/img/wn/11n@2x.png"
        }
    }
}
