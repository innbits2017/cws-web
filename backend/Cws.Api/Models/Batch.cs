
namespace Cws.Api.Models;

public class Batch
{
    public string BatchId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string OwnerDisplayName { get; set; } = "Demo Engineer";

    public string OwnerEmail { get; set; } = "demo.engineer@example.com";

    public string MaterialCode { get; set; } = string.Empty;

    public string MaterialRevision { get; set; } = string.Empty;

    public string Status { get; set; } = "Not run";

    public bool ErrorMode { get; set; }

    public bool SkipMode { get; set; }

    public decimal SuccessRate { get; set; }

    public DateTimeOffset? LastRunAt { get; set; }

    public int BatchSize { get; set; }

    public bool Shared { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public bool IsDemo { get; set; } = true;
}
