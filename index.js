const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

// Local data storage (in-memory database)
const rooms = [];
const bookings = [];

// API to create a room
app.post('/create-room', (req, res) => {
  const { name, seats, amenities, pricePerHour } = req.body;
  const room = {
    id: uuid.v4(),
    name,
    seats,
    amenities,
    pricePerHour,
  };
  rooms.push(room);
  res.json(room);
});

// API to book a room
app.post('/book-room', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Check if the room is available at the specified date and time
  const conflictingBooking = bookings.find((booking) =>
    booking.roomId === roomId &&
    booking.date === date &&
    (startTime < booking.endTime && endTime > booking.startTime)
  );

  if (conflictingBooking) {
    return res.status(400).json({ error: 'Room already booked at this time.' });
  }

  const booking = {
    id: uuid.v4(),
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };
  bookings.push(booking);
  res.json(booking);
});

// API to list all rooms with booked data
app.get('/list-rooms', (req, res) => {
   const roomsWithBookings = rooms.map((room) => {
    const roomBookings = bookings.filter((booking) => booking.roomId === room.id);
    return {
      roomName: room.name,
      bookedStatus: roomBookings.length > 0,
      bookings: roomBookings.map((booking) => ({
        customerName: booking.customerName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      })),
    };
  });
  res.json(roomsWithBookings);
});

// API to list all rooms with IDs
app.get('/list-rooms-with-id', (req, res) => {
    const roomsWithIds = rooms.map((room) => {
      return {
        id: room.id,
        roomName: room.name,
      };
    });
    res.json(roomsWithIds);
  });

// API to list all customers with booked data
app.get('/list-customers', (req, res) => {
    const customersWithBookings = bookings.map((booking) => {
      const room = rooms.find((room) => room.id === booking.roomId);
      if (room) {
        return {
          customerName: booking.customerName,
          roomName: room.name,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        };
      } else {
        // Handle the case where a booking references a non-existent room
        return {
          customerName: booking.customerName,
          roomName: "Room not found",
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        };
      }
    });
    res.json(customersWithBookings);
  });
  
// API to count how many times a customer has booked a room
app.get('/customer-booking-count/:customerName', (req, res) => {
  const customerName = req.params.customerName;
  const customerBookings = bookings.filter((booking) => booking.customerName === customerName);
  res.json(customerBookings);
});

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});