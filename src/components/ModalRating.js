import { View, Text, StyleSheet, Modal } from "react-native"
import { Button } from "@rneui/base"
import { useEffect, useState } from "react"

function StarButton({ pressed = false, onPress }) {
    const color = pressed ? '#FDCD03' : "#DADADA"
    return (
        <Button
            icon={{
                type: "font-awesome",
                name: "star",
                color,
                size: 35
            }}
            buttonStyle={styles.star}
            onPress={onPress}
        />
    )
}

function getArrayOf5Items(item) {
    const array = []
    for (let i = 0; i < 5; i++) {
        array.push(item)
    }
    return array
}

export function ModalRating({ visible = false, onPress, userToRate }) {
    const [rating, setRating] = useState(0)

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Ofrece una calificación a tu viaje</Text>
                    <View style={styles.stars}>
                        {getArrayOf5Items(false).map((_, index) => <StarButton key={index} pressed={index <= rating} onPress={() => setRating(index)} />)}
                    </View>
                    <Button titleStyle={styles.textButton} buttonStyle={styles.buttonModal} onPress={onPress} title='Aceptar' color={styles.buttonModal.color} />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 22,
        backgroundColor: 'white',
        borderRadius: 5,
        paddingVertical: 30,
        paddingHorizontal: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        fontFamily: "OpenSans-Regular",
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
        marginHorizontal: 20,
        width: 180
    },
    textButton: {
        color: 'black',
        fontSize: 14,
    },
    buttonModal: {
        marginTop: 20,
        height: 35,
        alignSelf: "center",
        borderRadius: 10,
        color: "#FFCDDD",
        paddingHorizontal: 20
    },
    stars: {
        flexDirection: "row",
        columnGap: 0
    },
    star: {
        backgroundColor: "#FFF",
        color: "#FDCD03",
        margin: -10
    }
})