import { StyleSheet, View, Text } from "react-native";
import { deleteDriverCard, deletePassengerPaymentMethod, getDriverCards, getPassengerPaymentMethods, updateDriverCard, updatePassengerPaymentMethod } from "../services/stripe";
import { useState, useEffect, useContext, useCallback } from "react";
import { FlatList } from "react-native-gesture-handler";
import { Card } from "./Card";
import UserContext from "../context/UserContext";
import { Button } from "@rneui/base";
import { useFocusEffect } from "@react-navigation/native";

export function ListOfCards({ navigation }) {
    const [cards, setCards] = useState(null)
    const { userData: { idUserType } } = useContext(UserContext)

    useFocusEffect(
        useCallback(() => {
            let isActive = true

            const fetchCards = async () => {
                let cards

                if (idUserType === 1) {
                    cards = await getDriverCards({ id: "acct_1N11tn2UWKvKuybi" })
                } else {
                    cards = await getPassengerPaymentMethods({ id: "cus_NnxwRjNZtvRIHI" })
                }

                if (isActive) setCards(cards)
            }
            
            fetchCards()

            return () => { isActive = false }
        }, [])
    )

    const handlePressCard = async ({ id }) => {
        const newCards = cards.map((card) => card.id === id
            ? ({ ...card, isDefault: true })
            : ({ ...card, isDefault: false })
        )

        setCards(newCards)

        if (idUserType === 1) await updateDriverCard({ idAccount: 'acct_1N11tn2UWKvKuybi', idCard: id, isDefault: true })
        else await updatePassengerPaymentMethod({ idCustomer: "cus_NnxwRjNZtvRIHI", idPaymentMethod: id, isDefault: true })
    }

    const handleDeleteCard = async ({ id }) => {
        const oldCards = cards
        const newCards = cards.filter((card) => card.id !== id)

        setCards(newCards)

        let status
        if (idUserType === 1) {
            status = await deleteDriverCard({ idAccount: "acct_1N11tn2UWKvKuybi", idCard: id })
        } else {
            status = await deletePassengerPaymentMethod({ idCustomer: "cus_NnxwRjNZtvRIHI", idPaymentMethod: id })
        }
        if (status !== 204) setCards(oldCards)
    }

    const handleEditCard = (card) => {
        navigation.navigate('EditCard', { card })
    }

    const renderCard = ({ item }) => {
        const borderColor = item.isDefault ? "#hsla(220, 100%, 38%, 0.5)" : "#FFF"

        return <Card
            {...item}
            onPress={handlePressCard}
            onPressRightButton={handleDeleteCard}
            onPressLeftButton={() => handleEditCard(item)}
            borderColor={borderColor}
        />
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Tarjetas
            </Text>
            <View style={styles.cards}>
                <FlatList
                    data={cards}
                    renderItem={renderCard}
                    keyExtractor={item => item.id}
                />
            </View>
            <Button title="Agregar tarjeta" type="clear" buttonStyle={styles.button} onPress={() => navigation.navigate('AddCard')} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignContent: "center",
        backgroundColor: "#FFF"
    },
    text: {
        textAlign: "center",
        marginBottom: 10,
        fontFamily: "OpenSans-Bold",
        fontSize: 17
    },
    cards: {
        justifyContent: "space-around",
    },
    button: {
        backgroundColor: "#FFF",
        borderRadius: 8,
        marginVertical: 10,
        width: "80%",
        alignSelf: "center",
        shadowColor: "#111",
        shadowOpacity: 12,
        shadowRadius: 12,
        shadowOffset: {
            height: 30,
            width: 50
        },
        elevation: 5
    },
})