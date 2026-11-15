
namespace Cws.Api.Models;

public class Order
{
    public string OrderId { get; set; } = string.Empty;

    public string BatchId { get; set; } = string.Empty;

    public int SequenceNo { get; set; }

    public string? ConfigurationId { get; set; }

    public string OrderStatus { get; set; } = "Not run";

    public string? ErrorModeMessage { get; set; }

    public int? CadConfigurationSeconds { get; set; }

    public int CadRegenerationLoops { get; set; }

    public bool ResultFileAvailable { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
