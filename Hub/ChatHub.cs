using Microsoft.AspNetCore.SignalR;

namespace AngNetChat.Hub;

public class ChatHub: Microsoft.AspNetCore.SignalR.Hub
{
    private readonly IDictionary<string, UserChatRoomConnection> _connection;

    // Store connections between users and rooms in the chat application
    public ChatHub(IDictionary<string, UserChatRoomConnection> connection)
    {
        _connection = connection;
    }
    
    public async Task JoinRoom(UserChatRoomConnection userChatRoomConnection)
    {
        // add user to specified room
        // Store user's connection info
        await Groups.AddToGroupAsync(Context.ConnectionId, userChatRoomConnection.Room!);
        _connection[Context.ConnectionId] = userChatRoomConnection;
        // Notifies all user in the room that the new user has joined
        await Clients.Group(userChatRoomConnection.Room!).SendAsync("ReceiveMessage", "App Chat Room", $"{userChatRoomConnection.User} has joined the group", DateTime.Now);
        // Updates the list of connected users in the room
        await SendConnectedUser(userChatRoomConnection.Room!);
    }

    // Hub sends a message to all clients in the same room as the sender
    public async Task SendMessage(string message)
    {
        // checks if sender's connection ID exists in the _connection dictionary
        if (_connection.TryGetValue(Context.ConnectionId, out UserChatRoomConnection userChatRoomConnection))
        {
            // retrieves the object that contains the user's room info
            // then sends message to all clients in that room - sender's username and date/time
            await Clients.Group(userChatRoomConnection.Room!)
                .SendAsync("ReceiveMessage", userChatRoomConnection.User, message, DateTime.Now);
        }
    }

    // Method is called when a client disconnections from the hub
    public override Task OnDisconnectedAsync(Exception? exp)
    {
        // checks if disconnected client has a valid connection. if not - returns
        if (!_connection.TryGetValue(Context.ConnectionId, out UserChatRoomConnection userChatRoomConnection))
        {
            return base.OnDisconnectedAsync(exp);
        }

        // remove client's connection from dictionary 
        _connection.Remove(Context.ConnectionId);
        // send a message to the group indicating the user has left
        Clients.Group(userChatRoomConnection.Room!)
            .SendAsync("ReceiveMessage", "App Chat Room", $"{userChatRoomConnection.User} has Left the Group", DateTime.Now);
        // update list of connected users in the group
        SendConnectedUser(userChatRoomConnection.Room!);
        // cleanup
        return base.OnDisconnectedAsync(exp);
    }

    // Hub sends a list of connected users to all clients in a specific room
    public Task SendConnectedUser(string room)
    {
        // filters the dictionary to get users who are in the specified room
        var users = _connection.Values
            .Where(u => u.Room == room)
            .Select(s => s.User);
        // sends a list of users to all clients in the specified room via a SignalR message "ConnectedUser"
        return Clients.Group(room).SendAsync("ConnectedUser", users);
    }
}