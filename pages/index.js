import {
	Heading,
	Box,
	Image,
	Button,
	Text,
	Flex,
	Center,
	SimpleGrid,
	Drawer,
	DrawerContent,
	DrawerOverlay,
	DrawerHeader,
	DrawerBody,
	useDisclosure,
	Divider,
} from '@chakra-ui/react'
import { useState } from 'react'

const productDetails = [
	{
		id: 1,
		name: 'Glazed Donut',
		priceInCents: 100,
		description:
			'Description stuff is going to go here. Check it out and see if you like it',
		imageURL:
			'https://assets.epicurious.com/photos/54b0226d766062b20344580a/5:4/w_777,h_621,c_limit/51160200_glazed-doughnuts_1x1.jpg',
	},
	{
		id: 2,
		name: 'Assorted Donuts',
		priceInCents: 1000,
		description:
			'Description stuff is going to go here. Check it out and see if you like it',
		imageURL:
			'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/assorted-glazed-donut-royalty-free-image-905879330-1538167169.jpg',
	},
	{
		id: 3,
		name: 'Cherry-Filled Donuts',
		priceInCents: 800,
		description:
			'Description stuff is going to go here. Check it out and see if you like it',
		imageURL:
			'https://www.jocooks.com/wp-content/uploads/2013/03/cherry-filled-donuts-1.jpg',
	},
]
function ShoppingCart({ cartItems }) {
	const { isOpen, onOpen, onClose } = useDisclosure()
	return (
		<>
			<Button colorScheme="blue" onClick={onOpen}>
				View Cart
			</Button>
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

export default function Home() {
	const [cartItems, setCartItems] = useState([])

	const handleAddToCart = (product) => {
		setCartItems([...cartItems, product])
	}

	return (
		<Box>
			<Heading mb="16" textAlign="center">
				Shop our selection!
			</Heading>
			<Box mx="10%">
				<Flex justifyContent="end" pb="4">
					<ShoppingCart cartItems={cartItems} />
				</Flex>
				<SimpleGrid minChildWidth="300px" spacing="30px">
					{productDetails.map((productDetail) => (
						<Box borderWidth="1px" borderRadius="lg" key={productDetail.id}>
							<Box h="50%">
								<Image
									boxSize="100%"
									src={productDetail.imageURL}
									alt={productDetail.name}
								/>
							</Box>

							<Flex flexDirection="column" p="4">
								<Flex justifyContent="space-between" pb="4">
									<Text fontSize="lg" fontWeight="600">
										{productDetail.name}{' '}
									</Text>
									<Text>${(productDetail.priceInCents / 100).toFixed(2)}</Text>
								</Flex>
								<Text>{productDetail.description}</Text>
							</Flex>
							<Center py="4">
								<Button
									colorScheme="green"
									onClick={() => handleAddToCart(productDetail)}
								>
									add to cart
								</Button>
							</Center>
						</Box>
					))}
				</SimpleGrid>
			</Box>
		</Box>
	)
}
