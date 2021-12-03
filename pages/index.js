import {
	Heading,
	Box,
	Image,
	Button,
	Text,
	Flex,
	Center,
	SimpleGrid,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { productDetails } from './productDetails'
import { ShoppingCart } from './ShoppingCart'

const Home = () => {
	const [cartItems, setCartItems] = useState([])

	useEffect(() => {
		const getCartItems = async () => {
			//do stuff...probably fetch items 🤷‍♂️
		}
		getCartItems()
	}, [])

	const handleAddToCart = async (product) => {
		setCartItems([...cartItems, product])
		//this feels like a good spot to publish to a database😏
	}

	return (
		<Box>
			<Heading textAlign="center" mb="16">
				Shop our selection!
			</Heading>
			<Box mx="10%">
				<ShoppingCart cartItems={cartItems} />

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
									<Text fontSize="xl" fontWeight="600">
										{productDetail.name}{' '}
									</Text>
									<Text fontSize="large">
										${(productDetail.priceInCents / 100).toFixed(2)}
									</Text>
								</Flex>
								<Text fontSize="large">{productDetail.description}</Text>
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

export default Home
