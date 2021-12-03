import {
	Box,
	Button,
	Text,
	Flex,
	Drawer,
	DrawerContent,
	DrawerOverlay,
	DrawerHeader,
	DrawerBody,
	useDisclosure,
	Divider,
} from '@chakra-ui/react'

export function ShoppingCart({ cartItems }) {
	const { isOpen, onOpen, onClose } = useDisclosure()
	return (
		<>
			<Flex justifyContent="flex-end" pb="4">
				<Button colorScheme="blue" onClick={onOpen}>
					View Cart
				</Button>
			</Flex>

			<Drawer placement="right" onClose={onClose} isOpen={isOpen}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader borderBottomWidth="1px">Items In Cart</DrawerHeader>
					<DrawerBody>
						{cartItems.map((cartItem) => (
							<Box key={cartItem.name}>
								<Text>
									{cartItem.name} -- ${(cartItem.priceInCents / 100).toFixed(2)}
								</Text>
								<Divider />
							</Box>
						))}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	)
}
