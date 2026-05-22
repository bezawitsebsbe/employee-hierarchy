using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using OrgHierarchyApi.Data;
using System.IO;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace OrgHierarchyApi.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var builder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            builder.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString)
            );

            return new AppDbContext(builder.Options);
        }
    }
}