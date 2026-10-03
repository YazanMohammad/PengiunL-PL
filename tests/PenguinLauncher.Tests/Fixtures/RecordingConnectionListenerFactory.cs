using System.Collections.Concurrent;
using System.Net;
using Microsoft.AspNetCore.Connections;

namespace PenguinLauncher.Tests.Fixtures;

// Replaces Kestrel's socket transport, preserving real binding/configuration logic.
public sealed class RecordingConnectionListenerFactory : IConnectionListenerFactory
{
    private readonly ConcurrentQueue<EndPoint> _endpoints = new();
    private readonly ConcurrentQueue<RecordingListener> _listeners = new();

    public EndPoint[] Endpoints => _endpoints.ToArray();
    public bool AllListenersDisposed => _listeners.All(listener => listener.Disposed);

    public ValueTask<IConnectionListener> BindAsync(EndPoint endpoint,
        CancellationToken cancellationToken = default)
    {
        _endpoints.Enqueue(endpoint);
        var listener = new RecordingListener(endpoint);
        _listeners.Enqueue(listener);
        return ValueTask.FromResult<IConnectionListener>(listener);
    }

    private sealed class RecordingListener(EndPoint endPoint) : IConnectionListener
    {
        private readonly TaskCompletionSource<ConnectionContext?> _closed =
            new(TaskCreationOptions.RunContinuationsAsynchronously);

        public EndPoint EndPoint { get; } = endPoint;
        public bool Disposed { get; private set; }

        public async ValueTask<ConnectionContext?> AcceptAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                return await _closed.Task.WaitAsync(cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                return null;
            }
        }

        public ValueTask UnbindAsync(CancellationToken cancellationToken = default)
        {
            _closed.TrySetResult(null);
            return ValueTask.CompletedTask;
        }

        public ValueTask DisposeAsync()
        {
            Disposed = true;
            _closed.TrySetResult(null);
            return ValueTask.CompletedTask;
        }
    }
}
