import { useContext, useEffect, useState, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import UserContext from '../context/UserContext'
import SignInLikeContext from '../context/SingInLikeContext'

import { ModalReport } from '../components/ModalReport'
import { MapContainer } from '../components/MapContainer'
import { ToggleOnService } from '../components/ToggleOnService'

import { supabase } from '../services/supabase'

import useCurrentLocation from '../hooks/useCurrentLocation'

import tripStatus from '../utils/tripStatus'

function HomeDriver({ navigation }) {
  const { userData, dataIsLoaded } = useContext(UserContext)
  const { signInLike } = useContext(SignInLikeContext)
  const [trips, setTrips] = useState([])
  const { location, loaded } = useCurrentLocation()
  const channel = useRef(null)
  const interval = useRef(null)

  useEffect(() => {
    if (dataIsLoaded && !userData.idUserType) {
      if (signInLike === 'passenger') navigation.navigate('CompletePassengerProfile')
      if (signInLike === 'driver') navigation.navigate('CompleteDriverProfile')
    }
  }, [dataIsLoaded])

  const fetchTrips = async () => {
    const { data } = await supabase.rpc('getNearbyTrips', {
      lat: location.coords.latitude,
      long: location.coords.longitude,
      range: 5000
    })

    const filteredData = data.filter(trip => (trip.idstatus < tripStatus.PENDING || trip.iddriver === userData.id))

    const trips = filteredData.map(({
      id,
      children,
      cost,
      endpoint,
      startingpoint,
      idpassenger,
      idstatus,
      name_endpoint,
      name_startingpoint,
      idservicetype,
      idpaymentmethodtype
    }) => {

      const [spLongitude, spLatitude] = startingpoint.split(' ')
      const [epLongitude, epLatitude] = endpoint.split(' ')

      return ({
        id,
        children,
        cost,
        endpoint: { longitude: Number(epLongitude), latitude: Number(epLatitude) },
        startingpoint: { longitude: Number(spLongitude), latitude: Number(spLatitude) },
        idPassenger: idpassenger,
        idStatus: idstatus,
        nameEndpoint: name_endpoint,
        nameStartingpoint: name_startingpoint,
        idServicetype: idservicetype,
        idPaymentmethodType: idpaymentmethodtype
      })
    })

    setTrips(trips)
  }

  const listenTripChanges = () => {
    const newChannel = supabase
      .channel('trips')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trip' }, fetchTrips)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trip' }, fetchTrips)
      .subscribe()

    channel.current = newChannel
  }

  const sendCurrentLocation = () => {
    interval.current = setInterval(() => {
      channel.current.send({
        type: 'broadcast',
        event: userData.id,
        payload: {
          longitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      })
    }, 1000)
  }

  const stopSendingCurrentLocation = () => {
    clearInterval(interval.current)
  }

  const handleToggle = (onService) => {
    if (onService && loaded) {
      fetchTrips() // fetch initial trips
      listenTripChanges()
      sendCurrentLocation()
    } else if (!onService) {
      stopSendingCurrentLocation()
      if (channel.current) supabase.removeChannel(channel.current)
      setTrips([])
    }
  }

  const handleCancelledTrip = async (trip) => {
    const { error } = await supabase.from('trip').update({
      idstatus: tripStatus.DRAFT,
      iddriver: null
    }).eq('id', trip.id)
    if (error) console.log('selectTripOnDB', error)
  }

  const handleConfirmedTrip = async (trip) => {
    const { error } = await supabase.from('trip').update({
      idstatus: tripStatus.CONFIRMED,
      iddriver: userData.id
    }).eq('id', trip.id)
    if (error) console.log('selectTripOnDB', error)
  }

  const selectTripOnDB = async (trip) => {
    const { error } = await supabase.from('trip').update({ idstatus: tripStatus.PENDING }).eq('id', trip.id)
    if (error) console.log('selectTripOnDB ', error)
  }

  return (
    <View style={styles.container}>
      <MapContainer
        currentLocation={location}
        trips={trips}
        onSelectedTrip={selectTripOnDB}
        onConfirmedTrip={handleConfirmedTrip}
        onCancelledTrip={handleCancelledTrip}
      />
      <ToggleOnService onToggle={handleToggle} />
      <ModalReport
        visible={false}
        userToReport='afcfc3f6-4854-4976-88e8-57a8480fdd09'
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export { HomeDriver }