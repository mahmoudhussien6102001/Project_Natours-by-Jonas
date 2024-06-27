/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";
const stripe= Stripe('');


export const bookTour = async tourId => {
  try {
    const session = await axios({
     
      url: `api/v1/booking/chechout-session/${tourId}`,
      
    });
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};